/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
 *
 * The contents of this file are subject to the Netscape Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/NPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 *
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is Netscape
 * Communications Corporation.  Portions created by Netscape are
 * Copyright (C) 1998 Netscape Communications Corporation. All
 * Rights Reserved.
 *
 * Contributor(s): 
 */
#include <stdio.h>
#include "plstr.h"
#include "nsCSSProps.h"
#include "nsCSSKeywords.h"
#include "nsString.h"

static const char* kJunkNames[] = {
  nsnull,
  "",
  "123",
  "backgroundz",
  "zzzzzz",
  "#@$&@#*@*$@$#"
};

int TestProps() {
  int rv = 0;
  nsCSSProperty id;
  nsCSSProperty index;

  // First make sure we can find all of the tags that are supposed to
  // be in the table. Futz with the case to make sure any case will
  // work
  extern const char* kCSSRawProperties[];
  const char** et = &kCSSRawProperties[0];
  const char** end = &kCSSRawProperties[eCSSProperty_COUNT];
  index = eCSSProperty_UNKNOWN;
  while (et < end) {
    char tagName[100];
    PL_strcpy(tagName, *et);
    index = nsCSSProperty(PRInt32(index) + 1);

    id = nsCSSProps::LookupProperty(nsSubsumeCStr(tagName, PR_FALSE));
    if (id == eCSSProperty_UNKNOWN) {
      printf("bug: can't find '%s'\n", tagName);
      rv = -1;
    }
    if (id != index) {
      printf("bug: name='%s' id=%d index=%d\n", tagName, id, index);
      rv = -1;
    }

    // fiddle with the case to make sure we can still find it
    if (('a' <= tagName[0]) && (tagName[0] <= 'z')) {
      tagName[0] = tagName[0] - 32;
    }
    id = nsCSSProps::LookupProperty(nsAutoString(tagName));
    if (id < 0) {
      printf("bug: can't find '%s'\n", tagName);
      rv = -1;
    }
    if (index != id) {
      printf("bug: name='%s' id=%d index=%d\n", tagName, id, index);
      rv = -1;
    }
    et++;
  }

  // Now make sure we don't find some garbage
  for (int i = 0; i < (int) (sizeof(kJunkNames) / sizeof(const char*)); i++) {
    const char* tag = kJunkNames[i];
    id = nsCSSProps::LookupProperty(nsCAutoString(tag));
    if (id >= 0) {
      printf("bug: found '%s'\n", tag ? tag : "(null)");
      rv = -1;
    }
  }

  return rv;
}

int TestKeywords() {
  nsCSSKeywords::AddRefTable();

  int rv = 0;
  nsCSSKeyword id;
  nsCSSKeyword index;

  extern const char* kCSSRawKeywords[];

  // First make sure we can find all of the tags that are supposed to
  // be in the table. Futz with the case to make sure any case will
  // work
  const char**  et = &kCSSRawKeywords[0];
  const char**  end = &kCSSRawKeywords[eCSSKeyword_COUNT - 1];
  index = eCSSKeyword_UNKNOWN;
  while (et < end) {
    char tagName[512];
    char* underscore = &(tagName[0]);

    PL_strcpy(tagName, *et);
    while (*underscore) {
      if (*underscore == '_') {
        *underscore = '-';
      }
      underscore++;
    }
    index = nsCSSKeyword(PRInt32(index) + 1);

    id = nsCSSKeywords::LookupKeyword(nsSubsumeCStr(tagName, PR_FALSE));
    if (id <= eCSSKeyword_UNKNOWN) {
      printf("bug: can't find '%s'\n", tagName);
      rv = -1;
    }
    if (id != index) {
      printf("bug: name='%s' id=%d index=%d\n", tagName, id, index);
      rv = -1;
    }

    // fiddle with the case to make sure we can still find it
    if (('a' <= tagName[0]) && (tagName[0] <= 'z')) {
      tagName[0] = tagName[0] - 32;
    }
    id = nsCSSKeywords::LookupKeyword(nsSubsumeCStr(tagName, PR_FALSE));
    if (id <= eCSSKeyword_UNKNOWN) {
      printf("bug: can't find '%s'\n", tagName);
      rv = -1;
    }
    if (id != index) {
      printf("bug: name='%s' id=%d index=%d\n", tagName, id, index);
      rv = -1;
    }
    et++;
  }

  // Now make sure we don't find some garbage
  for (int i = 0; i < (int) (sizeof(kJunkNames) / sizeof(const char*)); i++) {
    const char* tag = kJunkNames[i];
    id = nsCSSKeywords::LookupKeyword(nsCAutoString(tag));
    if (eCSSKeyword_UNKNOWN < id) {
      printf("bug: found '%s'\n", tag ? tag : "(null)");
      rv = -1;
    }
  }

  nsCSSKeywords::ReleaseTable();
  return rv;
}

int main(int argc, char** argv)
{
  TestProps();
  TestKeywords();
  return 0;
}
