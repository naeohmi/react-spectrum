/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {LocalizedStrings, Message, MessageDictionary, MessageFormatter} from '@internationalized/message';
import {useCallback, useMemo} from 'react';
import {useLocale} from './context';

export type FormatMessage<K extends string = string> = (key: K, variables?: Record<string, string | number | boolean>) => string;

const cache = new WeakMap();
function getCachedDictionary<K extends string, T extends Message>(strings: LocalizedStrings<K, T>): MessageDictionary<K, T> {
  let dictionary = cache.get(strings);
  if (!dictionary) {
    dictionary = new MessageDictionary(strings);
    cache.set(strings, dictionary);
  }

  return dictionary;
}

/**
 * Handles formatting ICU Message strings to create localized strings for the current locale.
 * Automatically updates when the locale changes, and handles caching of messages for performance.
 * @param strings - A mapping of languages to strings by key.
 */
export function useMessageFormatter<K extends string, T extends Message>(strings: LocalizedStrings<K, T>): FormatMessage<K> {
  let {locale} = useLocale();
  let dictionary = useMemo(() => getCachedDictionary(strings), [strings]);
  let formatter = useMemo(() => new MessageFormatter(locale, dictionary), [locale, dictionary]);
  return useCallback((key, variables) => formatter.format(key, variables), [formatter]);
}
