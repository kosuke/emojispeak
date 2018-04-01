#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

# Basic info
AUTHOR = u'Kosuke Katsuki'
SITENAME = u'Emojispeak'
SITESUBTITLE = u'Japanese'
SITEDESCRIPTION = u'Learn Japanese words and phrases with emojis. Designed for both beginners and advanced learners.'
SITEKEYWORDS = u'Japanese, Language, Emoji, Phrases, Phrase book'

# This will be overridden by publishconf.py
SITEURL = 'http://localhost:8000'
GOOGLE_ANALYTICS = False
GOOGLE_ANALYTICS_ID = ''

# Settings
STATIC_PATHS = ['images',]  
SLUGIFY_SOURCE = 'basename'
USE_FOLDER_AS_CATEGORY = False
DEFAULT_CATEGORY = 'Other'
DEFAULT_DATE = 'fs'
FILENAME_METADATA = '(?P<slug>.*)'
PATH = 'content'
TIMEZONE = 'Japan'
DEFAULT_LANG = u'en'
DEFAULT_DATE_FORMAT = '%d %b %Y'
WITH_FUTURE_DATES = True 

# URL
ARTICLE_URL = 'posts/{slug}'
ARTICLE_SAVE_AS = 'posts/{slug}/index.html'
PAGE_URL = 'pages/{slug}'
PAGE_SAVE_AS = 'pages/{slug}/index.html'

# Default pages
DIRECT_TEMPLATES = ['index', 'search', 'tags', 'categories', 'posts_json' ]
AUTHORS_SAVE_AS = ''
AUTHOR_SAVE_AS = ''
ARCHIVES_SAVE_AS = ''
CATEGORY_SAVE_AS = ''
TAG_SAVE_AS = ''
POSTS_JSON_SAVE_AS = 'posts.json'

# Menus
DISPLAY_PAGES_ON_MENU = False
def create_menus(site_url) :
    menu1 = [('Categories', site_url + '/categories.html'),
            ('Tags', site_url + '/tags.html'), ] 
    menu2 = [('Settings', site_url + '/pages/settings'),
            ('Privacy Policy', site_url + '/pages/privacy'),
            ('About', site_url + '/pages/about'),]
    return menu1, menu2

MENUITEMS, MENUITEMS2 = create_menus(SITEURL)

# Custom Jinja filter for sorting categories
def cat_accept(accepted): 
    def f(categories):
        return (c for c in categories if c[0] in accepted)
    return f

def cat_reject(rejected): 
    def f(categories):
        return (c for c in categories if c[0] not in rejected)
    return f

sentence_type = ('imperative', 'interrogative', 'declarative')
word_type = ('noun', 'adjective', 'verb', 'adverb')
JINJA_FILTERS = {
        'category_sentences': cat_accept(sentence_type),
        'category_words': cat_accept(word_type),
        'category_other': cat_reject(sentence_type + word_type),}

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Social widget
SOCIAL = (('You can add links in your config file', '#'),
          ('Another social link', '#'),)

DEFAULT_PAGINATION = 0

# Theme
THEME = 'theme'
GOOGLE_FONTS = ['Gentium+Book+Basic', 'Material+Icons']
FAVICON = '/images/icon.png'
APPLEICON120 = FAVICON
COLOPHON = '© 2015-2018 Kosuke Katsuki'

# Plugin
PLUGIN_PATHS = ['plugins']
PLUGINS = ['emoji2png', 'sitemap']

# emoji-capture 
CAPTURE_PATH = "../EmojiCapture/build/emojicapture"

