let message = "Merge pull request #54 from studentportaal/C-Alexander-patch-1 is pretty cool huh?";
    message = message.replace(/(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/, '[url removed]');
    message = message.replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/,"[Email Removed]")
    message = message.replace(/(Merge pull request #[0-9]* from [A-z0-9.\-]*\/[A-z0-9.\-]*)/, '')

    console.log(message);