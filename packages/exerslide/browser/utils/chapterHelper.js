/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This does a very simply grouping of slides based on an explicitly set chapter
 * name on the slide, or the file path hash of the slide.
 *
 * It returns something like [slide, slide, [slide, slide slide], slide], where
 * a nested array represents a chapter (group).
 *
 * @param {Array} slides An arrow of slide objects.
 */
export function groupByChapter(slides) {
  return slides.reduce(
    (groupedSlides, slide) => {
      let previousEntry = groupedSlides[groupedSlides.length - 1];
      if (Array.isArray(previousEntry) &&
          (slide.options.chapter === previousEntry[0].options.chapter ||
           slide.pathHash && slide.pathHash === previousEntry[0].pathHash)
      ) {
        previousEntry.push(slide);
      } else if (slide.options.chapter) { // new chapter
        groupedSlides.push([slide]);
      } else {
        groupedSlides.push(slide);
      }
      return groupedSlides;
    },
    []
  );
}
