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
#ifndef nsMarkupDocument_h___
#define nsMarkupDocument_h___

#include "nsDocument.h"
#include "nsIHTMLDocument.h"

class nsICSSDeclaration;
class nsICSSStyleRule;

/**
  * MODULE NOTES:
  * @update  gpk 7/17/98
  *
  * This class is designed to sit between nsDocument and 
  * classes like nsHTMLDocument. It contains methods which
  * are outside the scope of nsDocument but might be used
  * by both HTML and XML documents.
  *
  */


class nsMarkupDocument : public nsDocument {
public:
  nsMarkupDocument();
  virtual ~nsMarkupDocument();

  /**
    * Converts the document or a selection of the 
    * document to XIF (XML Interchange Format)
    * and places the result in aBuffer.
    
    * NOTE: we may way to place the result in a stream,
    * but we will use a string for now -- gpk
  */
  virtual void FinishConvertToXIF(nsXIFConverter& aConverter, nsIDOMNode* aNode);
  
  // XXX Temp hack: moved from nsDocument
  NS_IMETHOD CreateShell(nsIPresContext* aContext,
                         nsIViewManager* aViewManager,
                         nsIStyleSet* aStyleSet,
                         nsIPresShell** aInstancePtrResult);

protected:
  virtual void CSSSelectorsToXIF(nsXIFConverter& aConverter, nsICSSStyleRule& aRule);
  virtual void CSSDeclarationToXIF(nsXIFConverter& aConverter, nsICSSDeclaration& aDeclaration);
  virtual void StyleSheetsToXIF(nsXIFConverter& aConverter);


private:
};

#endif /* nsMarkupDocument_h___ */
