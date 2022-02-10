#!/bin/bash

session='trades-manager'

tmux new -d -s $session 'npm run watch'
#tmux send-keys -t 'watch' 'npm run watch' C-m
tmux split-window -h 'npm run browser-sync'
#tmux neww -n 'browser-sync' 'npm run browser-sync'

tmux attach-session -t $session:0
