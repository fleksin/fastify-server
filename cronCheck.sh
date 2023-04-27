oktcHead=$(curl http://127.0.0.1:9527/script/getOktcCommit);
okbcHead=$(curl http://127.0.0.1:9527/script/getOkbcCommit);
oktcRemote=$(curl http://124.221.148.179:8080/github-webhook/okx/get-master-head);
okbcRemote=$(curl http://124.221.148.179:8080/github-webhook/okx/get-okbc-head);
echo oktc local $oktcHead
echo oktc remote $oktcRemote
echo okbc local $okbcHead
echo okbc remote $okbcRemote

updateDocDir=/Users/oker/Projects/fastify/updateDoc.sh

# echo display notification \"Oktc: $oktcHead \\n Okbc: $okbcHead\" with title \"Current Heads\"  | osascript

if [[ (${#oktcRemote} == 40 && $oktcRemote != $oktcHead) ]]; then
    echo display notification \"new change pushed to master branch\" with title \"Update Alert\"  | osascript
    $updateDocDir
elif [[ (${#okbcRemote} == 40 && $okbcRemote != $okbcHead) ]]; then
    echo display notification \"new change pushed to okbc branch\" with title \"Update Alert\"  | osascript
    $updateDocDir
else
    echo "nothing to update"
fi