#!/usr/bin/env bash
# Place in .platform/hooks/postdeploy directory
sudo certbot -n -d hiketrack.is404.net --nginx --agree-tos --email ebastian@byu.edu