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

import {ActionButton} from '@react-spectrum/button';
import {classNames, SlotProvider, unwrapDOMRef, useDOMRef, useHasChild, useStyleProps} from '@react-spectrum/utils';
import CrossLarge from '@spectrum-icons/ui/CrossLarge';
import {DialogContext, DialogContextValue} from './context';
import {DismissButton} from '@react-aria/overlays';
import {DOMRef} from '@react-types/shared';
import {FocusScope} from '@react-aria/focus';
import {Grid} from '@react-spectrum/layout';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps} from '@react-aria/utils';
import React, {useContext, useMemo, useRef} from 'react';
import {SpectrumDialogProps} from '@react-types/dialog';
import styles from '@adobe/spectrum-css-temp/components/dialog/vars.css';
import {useDialog} from '@react-aria/dialog';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

let sizeMap = {
  S: 'small',
  M: 'medium',
  L: 'large',
  fullscreen: 'fullscreen',
  fullscreenTakeover: 'fullscreenTakeover'
};

function Dialog(props: SpectrumDialogProps, ref: DOMRef) {
  let {
    type = 'modal',
    ...contextProps
  } = useContext(DialogContext) || {} as DialogContextValue;
  let {
    children,
    isDismissable = contextProps.isDismissable,
    onDismiss = contextProps.onClose,
    size,
    ...otherProps
  } = props;
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let {styleProps} = useStyleProps(otherProps);

  size = type === 'popover' ? (size || 'S') : (size || 'L');

  let domRef = useDOMRef(ref);
  let gridRef = useRef();
  let sizeVariant = sizeMap[type] || sizeMap[size];
  let {dialogProps, titleProps} = useDialog(mergeProps(contextProps, props), domRef);

  let hasHeader = useHasChild(`.${styles['spectrum-Dialog-header']}`, unwrapDOMRef(gridRef));
  let hasHeading = useHasChild(`.${styles['spectrum-Dialog-heading']}`, unwrapDOMRef(gridRef));
  let hasFooter = useHasChild(`.${styles['spectrum-Dialog-footer']}`, unwrapDOMRef(gridRef));
  let hasTypeIcon = useHasChild(`.${styles['spectrum-Dialog-typeIcon']}`, unwrapDOMRef(gridRef));

  let slots = useMemo(() => ({
    hero: {UNSAFE_className: styles['spectrum-Dialog-hero']},
    heading: {UNSAFE_className: classNames(styles, 'spectrum-Dialog-heading', {'spectrum-Dialog-heading--noHeader': !hasHeader, 'spectrum-Dialog-heading--noTypeIcon': !hasTypeIcon}), level: 2, ...titleProps},
    header: {UNSAFE_className: classNames(styles, 'spectrum-Dialog-header', {'spectrum-Dialog-header--noHeading': !hasHeading, 'spectrum-Dialog-header--noTypeIcon': !hasTypeIcon})},
    typeIcon: {UNSAFE_className: styles['spectrum-Dialog-typeIcon']},
    divider: {UNSAFE_className: styles['spectrum-Dialog-divider'], size: 'M'},
    content: {UNSAFE_className: styles['spectrum-Dialog-content']},
    footer: {UNSAFE_className: styles['spectrum-Dialog-footer']},
    buttonGroup: {UNSAFE_className: classNames(styles, 'spectrum-Dialog-buttonGroup', {'spectrum-Dialog-buttonGroup--noFooter': !hasFooter}), align: 'end'}
  }), [styles, hasFooter, hasHeader, titleProps]);

  // If rendered in a popover or tray there won't be a visible dismiss button,
  // so we render a hidden one for screen readers.
  let dismissButton: JSX.Element;
  if (type === 'popover' || type === 'tray') {
    dismissButton = <DismissButton onDismiss={onDismiss} />;
  }

  return (
    <FocusScope contain restoreFocus>
      <section
        {...styleProps}
        {...dialogProps}
        className={classNames(
          styles,
          'spectrum-Dialog',
          {
            [`spectrum-Dialog--${sizeVariant}`]: sizeVariant,
            'spectrum-Dialog--dismissable': isDismissable
          },
          styleProps.className
        )}
        ref={domRef}>
        <Grid ref={gridRef} UNSAFE_className={styles['spectrum-Dialog-grid']}>
          <SlotProvider slots={slots}>
            {children}
          </SlotProvider>
          {isDismissable &&
            <ActionButton
              UNSAFE_className={styles['spectrum-Dialog-closeButton']}
              isQuiet
              aria-label={stringFormatter.format('dismiss')}
              onPress={onDismiss}>
              <CrossLarge />
            </ActionButton>
          }
        </Grid>
        {dismissButton}
      </section>
    </FocusScope>
  );
}

/**
 * Dialogs are windows containing contextual information, tasks, or workflows that appear over the user interface.
 * Depending on the kind of Dialog, further interactions may be blocked until the Dialog is acknowledged.
 */
let _Dialog = React.forwardRef(Dialog);
export {_Dialog as Dialog};
