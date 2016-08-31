/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {setSlideCacheData, getSlideCacheData} from 'exerslide/browser';
import ContentRenderer  from 'exerslide/components/ContentRenderer';
import React from 'react';

import './css/bulletList.css';

const DEFAULT_CACHE_DATA = {last: 0};
const CACHE_KEY = 'exerslide-plugin-bulletlist-layout';

export default class BulletList extends React.Component {
  constructor(props) {
    super(props);
    this.state = getSlideCacheData(
      props.slideIndex,
      CACHE_KEY,
      DEFAULT_CACHE_DATA
    );
  }

  componentsWillReceiveProps(nextProps) {
    if (this.props.slideIndex !== nextProps.slideIndex) {
      this.setState(getSlideCacheData(
        nextProps.slideIndex,
        CACHE_KEY,
        DEFAULT_CACHE_DATA
      ));
    }
  }

  _getBulletPoints() {
    return this.props.content.split(/^-\s*/m)
      .map(content => content.replace(/\s+$/, ''))
      .filter(Boolean);
  }

  onForward() {
    var bulletPoints = this._getBulletPoints();
    if (this.state.last < bulletPoints.length - 1) {
      var data = {last: this.state.last + 1};
      setSlideCacheData(this.props.slideIndex, CACHE_KEY, data);
      this.setState(data);
      // we handled the event, no need to advance slide
      return true;
    }
  }

  render() {
    const bulletPoints = this._getBulletPoints()
      .slice(0, this.state.last + 1)
      .map((value, i)=> <li key={i}><ContentRenderer value={value} /></li>);

    return (
      <div className="BulletList-wrapper">
        {this.props.title}
        <ul>
          {bulletPoints}
        </ul>
      </div>
    );
  }
}
