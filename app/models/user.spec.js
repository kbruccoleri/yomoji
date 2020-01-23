var knex = require("knex");
var mockDb = require("mock-knex");
var db = knex({
  client: "sqlite"
});
mockDb.mock(db);

const User = require("./user")(db);
var tracker = require("mock-knex").getTracker();

jest.mock('../slack', () => ({
  getUsersInfo: () => ({
    user: {
      user_name: 'Mr. Robot',
      is_bot: true,
    }
  })
}));

describe("User", () => {
  beforeEach(() => {
    tracker.install();
  });

  afterEach(() => {
    tracker.uninstall();
    jest.clearAllMocks();
  });

  describe("findOrCreate", () => {
    describe("user already exists", () => {
      beforeEach(() => {
        tracker.on("query", query => {
          expect(query.method).toEqual("select");
          query.response([
            {
              user_name: "Sample Username"
            }
          ]);
        });
      });

      it("returns that user", async () => {
        const user = await User.findOrCreate("Sample Username")
        expect(user.user_name).toEqual("Sample Username")
      });
    });

    describe("user does not already exist", () => {
      beforeEach(() => {
        tracker.on('query', function sendResult(query, step) {
          [
            () => {
              expect(query.method).toEqual("select");
              query.response([]);
            },
            () => {
              expect(query.method).toEqual("insert");
              query.response([{id: 1, user_name: 'Mr. Robot', is_bot: true, limit: 5}]);
            }
          ][step - 1]();
        });
      });

      it("creates a new user", async () => {
        const user = await User.findOrCreate("Mr. Robot")
        expect(user.id).toEqual(1)
        expect(user.user_name).toEqual("Mr. Robot")
        expect(user.is_bot).toEqual(true)
        expect(user.limit).toEqual(5)
      });
    });
  });

  describe("getSent", () => {
    it("fetches all user events sent from the user", async () => {
      tracker.on('query', query => {
        expect(query.method).toEqual('select');
        expect(query.sql).toContain('user_event');
        expect(query.sql).toContain('where `from_id` = ?');
        expect(query.bindings).toEqual([95]);
        query.response([{
          count: 4,
        }])
      });
      User.findOrCreate = jest.fn(() => ({id: 95}));

      const count = await User.getSent("sample username");
      expect(count).toEqual(4);
    });
  })

  describe("getReceived", () => {
    it("fetches all user events sent to the user", async () => {
      tracker.on('query', query => {
        expect(query.method).toEqual('select');
        expect(query.sql).toContain('user_event');
        expect(query.sql).toContain('where `to_id` = ?');
        expect(query.bindings).toEqual([95]);
        query.response([{
          count: 8,
        }])
      });
      User.findOrCreate = jest.fn(() => ({id: 95}));

      const count = await User.getReceived("sample username");
      expect(count).toEqual(8);
    });
  })

  describe("getLimit", () => {
    it("fetches the limit property of the user", async () => {
      tracker.on('query', query => {
        expect(query.method).toEqual('first');
        expect(query.sql).toContain('user');
        expect(query.bindings).toContain(95);
        query.response([{
          limit: 5,
        }])
      });
      User.findOrCreate = jest.fn(() => ({id: 95}));

      const count = await User.getLimit("sample username");
      expect(count).toEqual(5);
    });
  })

  describe("decrement", () => {
    it("decrements 1 by default", async () => {
      tracker.on('query', query => {
        expect(query.method).toEqual('update');
        expect(query.sql).toContain('user');
        expect(query.bindings).toEqual([1, 95]);
        query.response({});
      });
      User.findOrCreate = jest.fn(() => ({id: 95}));

      await User.decrement("sample username");
    });

    it("decrements by given amount", async () => {
      tracker.on('query', query => {
        expect(query.method).toEqual('update');
        expect(query.sql).toContain('user');
        expect(query.bindings).toEqual([5, 95]);
        query.response({});
      });
      User.findOrCreate = jest.fn(() => ({id: 95}));

      await User.decrement("sample username", 5);
    })

    it("does nothing if amount is negative", async () => {
      tracker.on('query', () => {
        fail('No query should fire')
      });
      await User.decrement("sample username", -1);
    })

    it("does nothing if amount is above daily limit", async () => {
      tracker.on('query', () => {
        fail('No query should fire')
      });
      await User.decrement("sample username", 6);
    })
  });
});
