## Simple telegram bot to show stats about CS server. Tested on CS 1.6

To use other game, check for type: 'counterstrike16' in code and [games list here](https://github.com/gamedig/node-gamedig/blob/master/GAMES_LIST.md)

### It was made for free hosting on [DigitalOcean](https://m.do.co/c/ca88ff4b0fe8) via 'Functions'

To build a project and push it on DigitalOcean, enough to connect via doctl [Check for doc for it on DigitalOcean](https://docs.digitalocean.com/reference/doctl/reference/serverless/)

### final deployment command will be

> doctl serverless deploy .\repository-folder\ --remote-build

Remember to link it with Telegram. **_Change_ TELEGRAM_BOT_API_KEY YOUR_FUNCTION_LINK before use it**

### To get link from doctl
> doctl sls fn get FUNCTION_NAME

> curl -X POST -F "url=YOUR_FUNCTION_LINK" https://api.telegram.org/botTELEGRAM_BOT_API_KEY/setWebhook

