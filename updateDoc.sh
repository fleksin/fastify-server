echo display notification \"try to update docs\" with title \"Update Start\"  | osascript
msg=$(curl http://127.0.0.1:9527/script/mainProcess);
echo display notification \"$msg\" with title \"Update Result\"  | osascript
osascript -e 'display notification commit'