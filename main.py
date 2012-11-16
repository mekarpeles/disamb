import web
import json
import urllib
installdir = '/home/sabalaba/not-baybo/disamb'

# url mapping
urls = (
        '/pipe/?', 'Pipe',
        '/', 'Index',
        '/disamb/?', 'Index'
        )

app = web.application(urls, globals())

# global vars
the_globals = {}

render = web.template.render(installdir + '/templates/',
                             base='layout',
                             globals=the_globals)
class Pipe:
    def GET(self):
        i = web.input()
        url = urllib.unquote(i.p)
        return urllib.urlopen(url)

class Index:
    def GET(self):
        return render.index()

if __name__ == "__main__":
    app.run()
