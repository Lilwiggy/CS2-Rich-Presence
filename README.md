# Counter Strike 2 Rich Presence Discord Integration

## Install
### Linux
Simply download the [install.sh](https://github.com/Lilwiggy/CS2-Rich-Presence/blob/main/install.sh) script attached in this repo and run
```bash
./install.sh
```
This will download the latest release of this repository and create a system service file.
If the service is not running when you check:
```bash
systemctl status csrpc
```
Then run the following:
```bash
sudo systemctl daemon-reload
sudo systemctl restart csrp
```
### Windows
Coming soon as I am too lazy to boot up windows to write an installer at this moment

## What do?
This application uses Valve's [Gamestate Integration](https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration) to provide data to Discord's Rich Presence feature which allows us to do the following:
### Prettier menu status!
![Menu Example](https://i.imgur.com/VtsAdYy.png "Prettier menu status")
### Live mid-round stats!
![Mid Round Example](https://i.imgur.com/YC7JpEq.png "Mid round stats")
### Spectating support
![Spectator Example](https://i.imgur.com/MAYLZXE.png "Spectator support")

## Supporting
If you enjoy this project please give it a star! You can also buy me a coffee on [Ko-Fi](https://ko-fi.com/lilwiggy)