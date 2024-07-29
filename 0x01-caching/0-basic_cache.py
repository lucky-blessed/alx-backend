#!/usr/bin/env python3
"""
BassicCache module.
"""


from base_caching import BaseCaching


class BasicCache(BaseCaching):
    """
       BasicCache is a caching system that inherits
       from the Basecaching. This caching system doen't
       have any limit.
    """

    def put(self, key, item):
        """
        Add an item in the cache.
        """
        if key is not None and item is not None:
            self.cache_data[key] = item

    def get(self, key):
        """
            Get an item by key.
        """
        return self.cache_data.get(key, None)
