let RPC = require('discord-rpc');
let zone = "Main page";
module.exports = class DiscordRPC {
    constructor(clientID) {
        this.id = clientID;
        this.rpc = new RPC.Client({ transport: 'ipc' });
        this.date = Date.now();
        this.state = 'Using the application';
    }

    start(user) {
        /**
         *details: `Navigating in ${zone}`,
            state: `Using the guest mode`,
         *  */
        let rpc = this.rpc,
            data = this.data,
            date = this.date,
            id = this.id,
            state = this.state;
        
        rpc.on("ready", () => {
            rpc.setActivity({
                details: (typeof user === 'undefined' || user==null) ? 'Logged as Guest':'Logged on: '+user.username,
                state: state,
                startTimestamp: date,
                largeImageKey: 'logo',
                largeImageText: 'Using AncestryCode/AncestryApp',
                smallImageKey: 'discord',
                smallImageText: 'https://discord.gg/BX42pq29C5',
                instance: false
			});
            setInterval(() => {
                rpc.setActivity({
					details: (typeof user === 'undefined' || user==null) ? 'Logged as Guest':'Logged on: '+user.username,
					state: state,
					startTimestamp: date,
					largeImageKey: 'logo',
					largeImageText: 'Using AncestryCode/AncestryApp',
					smallImageKey: 'discord',
					smallImageText: 'https://discord.gg/BX42pq29C5',
					instance: false
				});
            }, 15e3);
        });
        function t() {
            retry();
        }
        function retry() {
            rpc.login({clientId: id}).catch((err) => {t()});
        }
        retry();
    }
	changeZone(x) {
		zone = x;
	}
    changeState(value) {
        this.state = value;
    }
}