const {
  TurnContext,
  MessageFactory,
  TeamsActivityHandler
} = require("botbuilder");
const { CourierClient } = require("@trycourier/courier");
const courier = CourierClient();

class BotActivityHandler extends TeamsActivityHandler {
  constructor() {
    super();
    /*  Teams bots are Microsoft Bot Framework bots.
            If a bot receives a message activity, the turn handler sees that incoming activity
            and sends it to the onMessage activity handler.
            Learn more: https://aka.ms/teams-bot-basics.

            NOTE:   Ensure the bot endpoint that services incoming conversational bot queries is
                    registered with Bot Framework.
                    Learn more: https://aka.ms/teams-register-bot. 
        */
    // Registers an activity event handler for the message event, emitted for every incoming message activity.
    this.onMessage(async (context, next) => {
      TurnContext.removeRecipientMention(context.activity);
      const text = context.activity.text.trim().toLocaleLowerCase();
      if (text.includes("add-user")) {
        await this.getUserProfile(context);
      } else if (text.includes("add-channel")) {
        await this.getChannelProfile(context);
      }

      await next();
    });
  }

  async getUserProfile(context) {
    const text = context.activity.text.trim();
    const {
      serviceUrl: service_url,
      from: { id: user_id },
      channelData: {
        tenant: { id: tenant_id }
      }
    } = context.activity;
    const [_, recipientId] = text.split(" ");
    const profile = {
      ms_teams: {
        user_id,
        tenant_id,
        service_url
      }
    };
    console.log(recipientId);
    console.log(profile);
    const { status: mergeStatus } = await courier.mergeProfile({
      recipientId,
      profile
    });
    console.log(mergeStatus);

    const mention = {
      mentioned: context.activity.from,
      text: `<at>${new TextEncoder().encode(context.activity.from.name)}</at>`,
      type: "mention"
    };

    const replyActivity = MessageFactory.text(
      `Hi ${mention.text}, your profile has been updated.`
    );
    replyActivity.entities = [mention];

    await context.sendActivity(replyActivity);
  }

  async getChannelProfile(context) {
    const text = context.activity.text.trim();
    const {
      serviceUrl: service_url,
      //conversation: { id: conversation_id },
      channelData: {
        tenant: { id: tenant_id },
        channel: { id: channel_id }
      }
    } = context.activity;
    const [_, recipientId] = text.split(" ");
    const profile = {
      ms_teams: {
        //conversation_id,
        channel_id,
        tenant_id,
        service_url
      }
    };
    console.log(recipientId);
    console.log(profile);
    const { status: mergeStatus } = await courier.mergeProfile({
      recipientId,
      profile
    });
    console.log(mergeStatus);

    const mention = {
      mentioned: context.activity.from,
      text: `<at>${new TextEncoder().encode(context.activity.from.name)}</at>`,
      type: "mention"
    };

    const replyActivity = MessageFactory.text(
      `Hi ${mention.text}, your channel profile has been updated.`
    );
    replyActivity.entities = [mention];

    await context.sendActivity(replyActivity);
  }
}

module.exports.BotActivityHandler = BotActivityHandler;
