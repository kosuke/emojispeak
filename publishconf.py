#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

# This file is only used if you use `make publish` or
# explicitly specify it as your config file.

import os
import sys
sys.path.append(os.curdir)
from pelicanconf import *

SITEURL = 'http://localhost:8000'
GOOGLE_ANALYTICS = True
GOOGLE_ANALYTICS_ID = ''

RELATIVE_URLS = False
WITH_FUTURE_DATES = False 
MENUITEMS, MENUITEMS2 = create_menus(SITEURL)
LOAD_CONTENT_CACHE = True

DELETE_OUTPUT_DIRECTORY = True
