# Emojispeak 

Source code of [emojispeak.com](https://emojispeak.com). The website is statically generated using [Pelican](https://github.com/getpelican/pelican), and updated daily by a cron job that runs on a Raspberry Pi 2.   

Note that this repository doesn't include the contents of the website.

# Usage 

## Prerequisites 

* Python 3.6, with the following packages: 

        $ pip install fabric3 pelican markdown 
        $ pip install pillow jsmin rcssmin python-slugify

* For editing/generating emoji images: 
    * macOS 10.13  
    * [Emoji Capture](https://github.com/kosuke/emoji-capture) 
    * [OptiPNG](http://optipng.sourceforge.net) 

## Commands

To start editing a new entry (opens a new TextEdit document): 

    $ fab create

To push draft entries into `content` folder: 

    $ fab push
    
To build the website and launch the debug server: 

    $ fab reserve

To synchronize the entire folder with a remote server (e.g., Raspberry Pi in your local network): 

    $ fab rpi

To publish the website to Firebase (requires Firebase CLI):

    $ fab firebase


