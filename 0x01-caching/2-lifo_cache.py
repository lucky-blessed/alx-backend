#!/usr/bin/env python3
""" LIFO Cache module
"""


from base_caching import BaseCaching


class LIFOCache(BaseCaching):
    """ LIFOCache is a caching system that inherits from BaseCaching.
    This caching system discards the item put in the cache
    when the cache reaches its limit.
    """

    def __init__(self):
        """ Initialize the cache
        """
        super().__init__()
        self.last_key = None

    def put(self, key, item):
        """Add an item in the cache
        """

        if key is not None and item is not None:
            if len(self.cache_data) >= BaseCaching.MAX_ITEMS and key not in self.cache_data:
                if self.last_key is not None:
                    print("DISCARD: {}".format(self.last_key))
                    del self.cache_data[self.last_key]
            self.cache_data[key] = item
            self.last_key = key

    def get(self, key):
        """ Get an item by key
        """
        return self.cache_data.get(key, None)
