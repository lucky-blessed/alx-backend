#!/usr/bin/env python3
"""
LRU Cache module
"""


from base_caching import BaseCaching


class LRUCache(BaseCaching):
    """
    LRUCache is a caching system that inherits from BaseCaching.
    This caching system discards the least recently used item
    the cache reaches limit.
    """

    def __init__(self):
        """
        Initialize the cache
        """

        super().__init__()
        self.order = []

    def put(self, key, item):
        """
        Add an item in the cache
        """
        if key is not None and item is not None:
            if key in self.cache_data:
                self.order.remove(key)
            elif len(self.cache_data) >= BaseCaching.MAX_ITEMS:
                least_used_key = self.order.pop(0)
                del self.cache_data[least_used_key]
                print("DISCARD: {}".format(least_used_key))
            self.cache_data[key] = item
            self.order.append(key)

    def get(self, key):
        """
        Get an item by key
        """
        if key in self.cache_data:
            self.order.remove(key)
            self.order.append(key)
            return self.cache_data[key]
        return None
