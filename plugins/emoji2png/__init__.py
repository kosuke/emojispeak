#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from pelican import signals
from pelican.readers import BaseReader
import os, sys, re, subprocess
from PIL import Image

save_enabled = sys.platform == 'darwin' 
command = os.path.dirname(os.path.abspath(__file__)) + '/emojicapture' 
image_path = 'content/images/build/'

def register():
    signals.initialized.connect(initialize)
    signals.content_object_init.connect(process)

def initialize(pelican_object): 
    global command
    if 'CAPTURE_PATH' in pelican_object.settings.keys():
        command = pelican_object.settings['CAPTURE_PATH'] 
        if not os.path.exists(command): 
            print("emoji-caputure not found at ", command)
    mkdir(image_path)

def mkdir(folder):
    import errno
    try:
        os.makedirs(folder)
    except OSError as e: 
        if e.errno == errno.EEXIST and os.path.isdir(folder):
            pass
        else: raise   

def process(object):
    if not hasattr(object, 'emoji') :
        return
    output_path = image_path + object.slug + '.png'
    # Remove the enclosing p/pre tags from the emoji text
    text = remove_tags(object._content)
    object.emoji_alt = text    
    if save_enabled :
        save_image(text, object.source_path, output_path)
    # Obtain dimensions
    image = Image.open(output_path)
    object.emoji_width = str(image.size[0])
    object.emoji_height = str(image.size[1])

PATTERN_TAG = re.compile(r'<[^>]+>')
def remove_tags(str):
    return PATTERN_TAG.sub('', str).replace("&quot;", "\"") # reverse escape

def save_image(text, source_path, output_path): 
    # Check if the image needs to be updated 
    if not (os.path.exists(output_path) and
            os.path.getmtime(output_path) > os.path.getmtime(source_path)):
        # Call converter and save an image file 
        font = os.path.dirname(__file__) + "/Apple Color Emoji.ttf"
        if os.path.isfile(font) : 
            subprocess.check_call([command, text, '-o', output_path,
                '--font', font]) 
        else: 
            subprocess.check_call([command, text, '-o', output_path,
                '--size', '48', '--half', '40']) 
        # Call optimizer
        subprocess.check_call(['optipng', '--quiet', output_path]) 
        print("Created emoji image file: %s " % output_path)
 
