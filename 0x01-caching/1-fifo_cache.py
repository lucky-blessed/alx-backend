#!/usr/bin/env python3
"""
FIFO Cache module
"""


from base_caching import BaseCaching


class FIFOCache(BaseCaching):
    """
    FIFOCache is a caching system which inherits from BaseCaching.
    It discards the first item put in the cache when
    the cache reahes its limits.
    """

    def __init__(self):
        """ Initialize the cache """

        super().__init__()
        self.order = []

    def put(self, key, item):
        """ Add an item in the cache
        """
        if key is not None and item is not None:
            if key in self.cache_data:
                self.order.remove(key)
            elif len(self.cache_data) >= BaseCaching.MAX_ITEMS:
                first_key = self.order.pop(0)
                del self.cache_data[first_key]
                print("DISCARD: {}".format(first_key))
            self.cache_data[key] = item
            self.order.append(key)

    def get(self, key):
        """ Get an item by key.
        """
        return self.cache_data.get(key, None)
