from fabric.api import *
import fabric.contrib.project as project
import os
import shutil
import sys
import socketserver
from datetime import datetime

from pelican.server import ComplexHTTPRequestHandler

# Local path configuration (can be absolute or relative to fabfile)
env.deploy_path = 'output'
DEPLOY_PATH = env.deploy_path

# Remote server configuration

# Port for `serve`
PORT = 8000

# Remote server/RPi
RPI_HOST = 'root@localhost:22:/var/www'

# Google Cloud
GS_HOST = 'gs://example.com/'

# Temp directory used by create()
CONTENT_PATH = "content"
TEMP_PATH = "temp"

def mkdir(folder):
    import errno
    try:
        os.makedirs(folder)
    except OSError as e: 
        if e.errno == errno.EEXIST and os.path.isdir(folder):
            pass
        else: raise        
@task
def create():
    """Create new post"""
    import subprocess
    def find_free_name(parent, ext):
        count = 0
        while True:
            path = os.path.join(parent, str(count) + ext) 
            if not os.path.isfile(path):
                return path
            count += 1
    # Create temp dir
    mkdir(TEMP_PATH)
    # Generate text
    date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    newText = ("Emoji:\n"
               "Date: %s\n" 
               "Category: declarative\n"
               "Tags: \n"
               "Title: \n" 
               "Kana: \n"
               "Romaji: \n"
               "English: \n") % date
    # Write to file
    newFile = open(find_free_name(TEMP_PATH, ".md"), "w")
    newFile.write(newText)
    newFile.close()
    print("Created file: ", newFile.name)
    # Open the file in TextEdit
    # FIXME: local()
    subprocess.check_call(["open", "-a", "TextEdit", newFile.name, ]) 

@task
def push() :
    """Process temp files and push them into content folder"""
    import re
    from slugify import slugify
    for file in os.listdir(TEMP_PATH):
        if file.endswith(".md"):
            source = os.path.join(TEMP_PATH, file)
            text = open(source, "r").read()
            # Slug
            match = re.search(r'English:(.+)', text)
            title = match.group(1).strip()
            slug = slugify(title)
            if not slug: 
                continue
            # Date
            match = re.search(r'Date:[\s]*(\d{4}-\d{1,2})', text)
            date = match.group(1).strip()
            d = datetime.strptime(date, '%Y-%m')
            folder = os.path.join(CONTENT_PATH, "%d%02d" % (d.year, d.month))
            # Create folder
            mkdir(folder)
            # TODO: Check if the same slug is already used
            # Move file
            destination = os.path.join(folder, slug+".md")
            os.rename(source, destination)
            print("Moved file: ", destination)

@task
def clean():
    """Remove generated files"""
    if os.path.isdir(DEPLOY_PATH):
        shutil.rmtree(DEPLOY_PATH)
        os.makedirs(DEPLOY_PATH)

@task
def clean_images():
    """Remove generated files under images/build"""
    local_dir = CONTENT_PATH.rstrip('/') + '/'
    image_dir = local_dir + 'images/build'
    if os.path.isdir(image_dir):
        shutil.rmtree(image_dir)
        os.makedirs(image_dir)

def minify():
    local('python -m jsmin theme/static/js/es.js > theme/static/js/es.min.js')
    local('python -m jsmin output/posts.json > output/posts.min.json')
    local('python -mrcssmin < theme/static/css/main.css > theme/static/css/main.min.css')

def build(nodraft = False):
    """Build local version of site"""
    if nodraft: 
        local('pelican -s nodraftconf.py')
    else:
        local('pelican -s pelicanconf.py')
    minify()

@task
def rebuild():
    """`clean` then `build`"""
    clean()
    build()

@task
def regenerate():
    """Automatically regenerate site upon file modification"""
    local('pelican -r -s pelicanconf.py')

@task
def serve():
    """Serve site at http://localhost:8000/"""
    os.chdir(env.deploy_path)

    class AddressReuseTCPServer(socketserver.TCPServer):
        allow_reuse_address = True

    server = AddressReuseTCPServer(('', PORT), ComplexHTTPRequestHandler)

    sys.stderr.write('Serving on port {0} ...\n'.format(PORT))
    server.serve_forever()

@task
def reserve():
    """`build`, then `serve`"""
    build()
    serve()

@task
def reserve_nodraft():
    """`build`, then `serve` with no draft"""
    build(nodraft=True)
    serve()

@task
def preview():
    """Build production version of site"""
    local('pelican -s publishconf.py')
    minify()

@task
def rpi():
    """Copy to Raspberry Pi2 via rsync"""
    local('rsync -av -e ssh . ' + RPI_HOST)

@task
def gs():
    """Publish to Google Cloud"""
    clean()
    local('pelican -s publishconf.py')
    minify()
    local_dir = DEPLOY_PATH.rstrip('/') + '/'
    image_dir = local_dir + 'images'
    local('gsutil -m -h "Cache-Control:public, max-age=2592000" cp -n -r {0} {1}'.format(image_dir, GS_HOST))
    local('gsutil -m rsync -d -R {0} {1}'.format(local_dir))
    #local('gsutil -m setmeta -h "Cache-Control:public, max-age=2592000" {0}images/*.png'.format(GS_HOST))

