    // Load serverlist and send command on change.
    var servers = $('#servers').change(function() {
         $.get(WEBDIR + 'ipcamera/changeserver?id='+$(this).val(), function(data) {
            notify('Ipcamera','Server change '+data,'info');
         });
    });
    $.get(WEBDIR + 'ipcamera/getserver', function(data) {
        if (data==null) return;
        $.each(data.servers, function(i, item) {
            server = $('<option>').text(item.name).val(item.id);
            if (item.name == data.current) server.attr('selected','selected');
            servers.append(server);
        });
    }, 'json');