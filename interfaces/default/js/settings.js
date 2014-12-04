$(document).ready(function () {
    $(window).trigger('hashchange')
    $('.btn-test').click(function(e) {
        e.preventDefault();
        var btn = $(this).button('loading');
        var action = btn.attr('data-target');
        var data = btn.parents('form:first').serialize();
        $.post(action, data, function(data) {
            btn.button('reset');
            if (data != null) {
                btn.addClass('btn-success').append(' ').append($('<i>').addClass('icon-white icon-ok'));
                if (data['Network.MacAddress'] && data['Network.MacAddress'] != 'Busy') {
                   $('#xbmc_server_mac:visible').val(data['Network.MacAddress']);
                }
            } else {
                btn.addClass('btn-danger').append(' ').append($('<i>').addClass('icon-white icon-exclamation-sign'));
            }
        }).error(function(){
            btn.button('reset');
            btn.addClass('btn-danger').append(' ').append($('<i>').addClass('icon-white icon-exclamation-sign'));
        });
    });
    $('input, radio, select, button').bind('change input', function(e) {
        $('.btn-test').button('reset').removeClass('btn-success btn-danger');
    });
    $('form').submit(function(e) {
        e.preventDefault();
        var action = $(this).attr('action')
        if (action === undefined) action = '';
        var data = $(this).serialize();
        $(this).find("input:checkbox:not(:checked)").each(function(e){
            data+='&'+$(this).attr('name')+'=0';
        });
        $.post(action, data, function(data) {
            msg = data ? 'Save successful' : 'Save failed';
            notify('Settings', msg, 'info');
            if ($('#xbmc_server_id').is(":visible")) {
                xbmc_update_servers(0);
                this.reset();
            }
        });
    });
    $('input.enable-module').change(function() {
        var disabled = !$(this).is(':checked');
        $(this).parents('fieldset:first').find('input, radio, select').not(this)
            .attr('readonly', disabled).attr('disabled', disabled);
    });
    $('input.enable-module').trigger('change')
    $('#xbmc_server_id').change(function() {
        $('button:reset:visible').html('Clear').removeClass('btn-danger').unbind();
        var item = $(this)
        var id = item.val()
        if (id == 0) $('button:reset:visible').trigger('click')
        $.get(WEBDIR + 'xbmc/getserver?id='+id, function(data) {
            if (data==null) return
            $('#xbmc_server_name').val(data.name);
            $('#xbmc_server_host').val(data.host);
            $('#xbmc_server_port').val(data.port);
            $('#xbmc_server_username').val(data.username);
            $('#xbmc_server_password').val(data.password);
            $('#xbmc_server_mac').val(data.mac);
            $("button:reset:visible").html('Delete').addClass('btn-danger').click(function(e) {
                var name = item.find('option:selected').text();
                if (!confirm('Delete ' + name)) return;
                $.get(WEBDIR + 'xbmc/delserver?id='+id, function(data) {
                    notify('Settings', 'Server deleted', 'info')
                    $(this).val(0)
                    item.find('option[value='+ id +']').remove()
                    $('button:reset:visible').html('Clear').removeClass('btn-danger').unbind();
                });
            });
        });
    });
    xbmc_update_servers(0);
    $('input.enable-module').trigger('change');
        $('#tvs').change(function () {
        var item = $(this);
        var id = item.val();
        $.get(WEBDIR + 'samsungtv/findtv?id=' + id, function (data) {
            console.log(data)
            if (data === null) return;
            //console.log(data.servers.serverName);
            alert(data.host);
            $('#samsungtv_host').val(data.host);
            $('#samsungtv_model').val(data.tv_model);
            $('#samsung_htpcmac').val(data.mac);
            $('#samsung_htpchost').val(data.local_ip);
            //$('#samsung_htpcmac').val(data.servers.port);
        });
    });
    samsung_tvs(0);
    /*
    host: "192.168.1.151"
    id: 6
    local_ip: "192.168.1.112"
    mac: "E8:E0:B7:D3:A4:62"
    name: "[TV]UE55D6300"
    tv_model: "UE55D6300

    */
});

function xbmc_update_servers(id) {
    $.get(WEBDIR + 'xbmc/getserver', function(data) {
        if (data==null) return;
        var servers = $('#xbmc_server_id').empty().append($('<option>').text('New').val(0));
        $.each(data.servers, function(i, item) {
            var option = $('<option>').text(item.name).val(item.id);
            if (id == item.id) option.attr('selected', 'selected');
            servers.append(option);
        });
    }, 'json');
}




































/*
    $('#tvs').change(function () {
        var item = $(this);
        var id = item.val();
        $.get(WEBDIR + 'samsungtv/findtv?id=' + id, function (data) {
            if (data === null) return;
            //console.log(data.servers.serverName);
            $('#samsungtv_name').val(data.name);
            $('#samsungtv_model').val(data.tv_model);
            $('#samsung_htpcmac').val(data.mac);
            $('#samsung_htpchost').val(data.local_ip);
            //$('#samsung_htpcmac').val(data.servers.port);
        });
    });
    samsung_tvs(0);
});
*/

function samsung_tvs(id) {
    $.get(WEBDIR + 'samsungtv/findtv', function (data) {
        if (data === null) return;
        var tv = $('#tvs').empty().append($('<option>').text('Select').val(0));
        $.each(data, function (i, item) {
            var option = $('<option>').text(item.name).val(item.id);
            if (id == item.id) option.attr('selected', 'selected');
            tv.append(option);
        });
    }, 'json');
}