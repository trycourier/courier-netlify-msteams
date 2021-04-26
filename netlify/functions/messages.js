const { BotFrameworkAdapter } = require("botbuilder");
const { BotActivityHandler } = require("../lib/botActivityHandler");

const adapter = new BotFrameworkAdapter({
  appId: process.env.MSTEAMS_APP_ID,
  appPassword: process.env.MSTEAMS_APP_PASSWORD
});

adapter.onTurnError = async (context, error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights.
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Send a trace activity, which will be displayed in Bot Framework Emulator
  await context.sendTraceActivity(
    "OnTurnError Trace",
    `${error}`,
    "https://www.botframework.com/schemas/error",
    "TurnError"
  );

  // Send a message to the user
  await context.sendActivity("The bot encountered an error or bug.");
  await context.sendActivity(
    "To continue to run this bot, please fix the bot source code."
  );
};

const botActivityHandler = new BotActivityHandler();

exports.handler = function (event, context, callback) {
  const req = {
    body: JSON.parse(event.body),
    headers: event.headers
  };

  let _status = null;
  let _body = null;
  const _respond = function (status, body) {
    callback(null, {
      statusCode: status || 200,
      body: body || ""
    });
  };

  const res = {
    send: function (status, body) {
      _respond(status, body);
    },
    status: function (status) {
      _status = status;
    },
    write: function (body) {
      _body = body;
    },
    end: function () {
      _respond(_status, _body);
    }
  };

  adapter.processActivity(req, res, async (context) => {
    // Process bot activity
    await botActivityHandler.run(context);
  });
};
