#!/bin/bash
if command -v node >&2; then
    printf "Hello and thank you for wanting to install my application. The install will proceed as follows:\n"
    printf "It will download the zip file containing the open sourced software found on GitHub, unzip it into ~/csrpc, and create a system service to auto start the application at system boot\n"
    printf "Would you like to proceed? (Y/N) Type y or n\n"
    read res
    if [ "$res" = "Y" ] || [ "$res" = "y" ]; then
        if command -v wget >&2; then
            wget https://github.com/Lilwiggy/CS2-Rich-Presence/archive/refs/heads/main.zip
            unzip main.zip -d $HOME
            rm main.zip
            mv $HOME/CS2-Rich-Presence-main $HOME/csrpc
            cd $HOME/csrpc
            npm install
            printf "Enter your CS2 install directory. In steam, right click CS2, and select browse local files.\nCopy the path you see in the top bar of your file explorer and paste the contents here:\n"
            read dir
            touch $HOME/.local/state/csrpc.txt && echo "$dir/game/csgo/cfg" > $HOME/.local/state/csrpc.txt
            # Create our service file
            printf "We need to create a system service file, this may prompt for your sudo password.\n"
            sudo tee /usr/bin/csrpc > /dev/null << EOF
#!/bin/bash
export NVM_DIR="/home/$USER/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
cd $HOME/csrpc
tsc
npm start
EOF
            sudo chmod +x /usr/bin/csrpc
            CURRENT_UID=$(id -u)
sudo tee /etc/systemd/system/csrpc.service > /dev/null << EOF
[Unit]
Description=CS2 RPC Service

[Service]
User=$USER
Group=$USER
Environment="XDG_RUNTIME_DIR=/run/user/$CURRENT_UID"
ExecStart=/usr/bin/csrpc

[Install]
WantedBy=multi-user.target
EOF
            sudo systemctl daemon-reload
            sudo systemctl enable csrpc
            printf "The CS2 Rich Presence application has been installed.\n"
        else
            printf "Could not find wget, please install wget with your preferred package manager then run the install script again\n"
            exit
        fi
    else
        printf "Okay :)\n"
        exit
    fi
else
    echo "NodeJS is not installed. Please visit https://nodejs.org/en to install"
    echo "or use a third party installer such as NodeVersionManager https://github.com/nvm-sh/nvm"
    echo "Afterwards, please run the install script again"
fi