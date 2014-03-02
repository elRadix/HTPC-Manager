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
    
    //http://jsfiddle.net/aAVQB/
    
    $('button').on('click', jQuery(this), function () {
    var lol = 'testus';
    x = jQuery(this).data('command');
    alert(x);
    //alert('lol');
});

$('button').on('keydown', '.movement', $(this), function () {
    var lol = 'testus';
    x = jQuery(this).data('command');
    alert(x);
    //alert('lol');
});