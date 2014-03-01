import cherrypy
import htpc
from sqlobject import SQLObject, SQLObjectNotFound
from sqlobject.col import StringCol, IntCol
import logging

class IpcameraServers(SQLObject):
    """ SQLObject class for xbmc_servers table """
    name = StringCol()
    host = StringCol()
    port = IntCol()
    username = StringCol(default=None)
    password = StringCol(default=None)
    mac = StringCol(default=None)
    type = StringCol(default=None)
    reversed = StringCol(default=None)

class Ipcamera:
    def __init__(self):
        """ Add module to list of modules on load and set required settings """
        self.logger = logging.getLogger('modules.xbmc')

        IpcameraServers.createTable(ifNotExists=True)
        htpc.MODULES.append({
            'name': 'Ipcamera',
            'id': 'ipcamera',
            'fields': [
                {'type':'bool',
                 'label':'Enable',
                 'name':'ipcamera_enable'},
                {'type':'text',
                 'label':'Menu name',
                 'name':'ipcamera_name'},
                {'type':'bool',
                 'label':'Enable PVR',
                 'name':'ipcamera_enable_pvr'},
                {'type':'bool',
                 'label':'Hide watched',
                 'name':'ipcamera_hide_watched'}
        ]})
        htpc.MODULES.append({
            'name': 'Ipcamera Servers',
            'id': 'ipcamera_update_server',
            'action': htpc.WEBDIR + 'ipcamera/setserver',
            'test': htpc.WEBDIR + 'xbmc/ping',
            'fields': [
                {'type':'select',
                 'label':'Server',
                 'name':'ipcamera_server_id',
                 'options':[
                    {'name':'New', 'value':0}
                ]},
                {'type':'text',
                 'label':'Name',
                 'name':'ipcamera_server_name'},
                {'type':'text',
                 'label':'IP / Host',
                 'name':'ipcamera_server_host'},
                {'type':'text',
                 'label':'Port',
                 'name':'ipcamera_server_port'},
                {'type':'text',
                 'label':'Username',
                 'name':'ipcamera_server_username'},
                {'type':'password',
                 'label':'Password',
                 'name':'ipcamera_server_password'},
                {'type':'text',
                 'label':'Mac addr.',
                 'name':'ipcamera_server_mac'}
        ]})
        server = htpc.settings.get('ipcamera_current_server', 0)
        self.changeserver(server)
    
    @cherrypy.expose()
    def index(self):
        """ Generate page from template """
        return htpc.LOOKUP.get_template('ipcamera2.html').render(scriptname='ipcamera')

    @cherrypy.expose()
    @cherrypy.tools.json_out()
    def getserver(self, id=None):
        if id:
            """ Get XBMC server info """
            try:
                server = IpcameraServers.selectBy(id=id).getOne()
                return dict((c, getattr(server, c)) for c in server.sqlmeta.columns)
            except SQLObjectNotFound:
                return

        """ Get a list of all servers and the current server """
        servers = []
        for s in IpcameraServers.select():
            servers.append({'id': s.id, 'name': s.name})
        if len(servers) < 1:
            return
        try:
            current = self.current.name
        except AttributeError:
            current = None
        return {'current': current, 'servers': servers}
    
    @cherrypy.expose()
    @cherrypy.tools.json_out()
    def setserver(self, ipcamera_server_id, ipcamera_server_name, ipcamera_server_host, ipcamera_server_port,
            ipcamera_server_username=None, ipcamera_server_password=None, ipcamera_server_mac=None):
        """ Create a server if id=0, else update a server """
        if ipcamera_server_id == "0":
            self.logger.debug("Creating XBMC-Server in database")
            try:
                id = IpcameraServers(name=ipcamera_server_name,
                        host=ipcamera_server_host,
                        port=int(ipcamera_server_port),
                        username=ipcamera_server_username,
                        password=ipcamera_server_password,
                        mac=ipcamera_server_mac)
                self.setcurrent(id)
                return 1
            except Exception, e:
                self.logger.debug("Exception: " + str(e))
                self.logger.error("Unable to create ipcamera in database")
                return 0
        else:
            self.logger.debug("Updating Ipcamera " + ipcamera_server_name + " in database")
            try:
                server = IpcameraServers.selectBy(id=ipcamera_server_id).getOne()
                server.name = xbmc_server_name
                server.host = xbmc_server_host
                server.port = int(xbmc_server_port)
                server.username = xbmc_server_username
                server.password = xbmc_server_password
                server.mac = xbmc_server_mac
                return 1
            except SQLObjectNotFound, e:
                self.logger.error("Unable to update Ipcamera " + server.name + " in database")
                return 0
    
    @cherrypy.expose()
    def delserver(self, id):
        """ Delete a server """
        self.logger.debug("Deleting server " + str(id))
        IpcameraServers.delete(id)
        self.changeserver()
        return
    
    @cherrypy.expose()
    @cherrypy.tools.json_out()
    def changeserver(self, id=0):
        try:
            self.current = IpcameraServers.selectBy(id=id).getOne()
            htpc.settings.set('ipcamera_current_server', id)
            self.logger.info("Selecting Ipcamera server: " + id)
            return "success"
        except SQLObjectNotFound:
            try:
                self.current = IpcameraServers.select(limit=1).getOne()
                self.logger.error("Invalid server. Selecting first Available.")
                return "success"
            except SQLObjectNotFound:
                self.current = None
                self.logger.warning("No configured Ipcamera.")
                return "No valid servers"
    
    @cherrypy.expose()
    @cherrypy.tools.json_out()
    def url(self, path='', auth=False):
        """ Generate a URL for the RPC based on XBMC settings """
        self.logger.debug("Generate URL to call Ipcamera")
        url = self.current.host + ':' + str(self.current.port) + path + '?user=' + self.current.username + '&pwd=' +self.current.password
        if auth and self.current.username and self.current.password:
            url = self.current.username + ':' + self.current.password + '@' + url

        self.logger.debug("URL: http://" + url)
        return 'http://' + url

    @cherrypy.expose()
    @cherrypy.tools.json_out()
    def command(self,  pre='', cmd=''):
        url = 'http://'+ self.current.host + ':'+ str(self.current.port) + '/' + pre + '/' + cmd + '/?user=' + self.current.username + '&pwd=' + self.current.password 
        return url
        x = urllib2.urlopen(url).read()
        print x