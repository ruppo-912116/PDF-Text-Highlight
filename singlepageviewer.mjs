/* Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

if (!pdfjsLib.getDocument || !pdfjsViewer.PDFSinglePageViewer) {
  // eslint-disable-next-line no-alert
  alert("Please build the pdfjs-dist library using\n  `gulp dist-install`");
}

// The workerSrc property shall be specified.
//
pdfjsLib.GlobalWorkerOptions.workerSrc = "./lib/pdf.worker.mjs";

// Some PDFs need external cmaps.
//
const CMAP_URL = "./cmaps/";
const CMAP_PACKED = true;

const DEFAULT_URL = "./sample.pdf";
// To test the AcroForm and/or scripting functionality, try e.g. this file:
// "../../test/pdfs/160F-2019.pdf"

const ENABLE_XFA = true;
const SEARCH_FOR = "Peter"; // try "Mozilla";

const SANDBOX_BUNDLE_SRC = new URL("./lib/pdf.sandbox.mjs", window.location);

const container = document.getElementById("viewerContainer");

const eventBus = new pdfjsViewer.EventBus();

// (Optionally) enable hyperlinks within PDF files.
const pdfLinkService = new pdfjsViewer.PDFLinkService({
  eventBus,
});

// (Optionally) enable find controller.
const pdfFindController = new pdfjsViewer.PDFFindController({
  eventBus,
  linkService: pdfLinkService,
});

// (Optionally) enable scripting support.
const pdfScriptingManager = new pdfjsViewer.PDFScriptingManager({
  eventBus,
  sandboxBundleSrc: SANDBOX_BUNDLE_SRC,
});

const pdfSinglePageViewer = new pdfjsViewer.PDFSinglePageViewer({
  container,
  eventBus,
  linkService: pdfLinkService,
  findController: pdfFindController,
  scriptingManager: pdfScriptingManager,
});
pdfLinkService.setViewer(pdfSinglePageViewer);
pdfScriptingManager.setViewer(pdfSinglePageViewer);

eventBus.on("pagesinit", function () {
  // We can use pdfSinglePageViewer now, e.g. let's change default scale.
  pdfSinglePageViewer.currentScaleValue = "page-width";

  // We can try searching for things.
  if (SEARCH_FOR) {
    eventBus.dispatch("find", {
      type: "",
      query: SEARCH_FOR,
      phraseSearch: true,
      highlightAll: true,
    });
  }
});

// When the find controller finds occurrences
eventBus.on("updatetextlayermatches", function (e) {
  console.log("drawing boxes", e);
  // drawBoxes(e.matches);
  drawBoxes();
});

// Draw boxes over the found occurrences
function drawBoxes(matches) {
  // const textLayer = document.querySelector(".textLayer");
  // if (!textLayer) return;

  // // Clear existing boxes
  // const existingBoxes = textLayer.querySelectorAll(".highlight-box");
  // existingBoxes.forEach((box) => box.remove());

  // const existingHighlights = document.getElementsByClassName("appended");
  // existingHighlights.forEach((existingHighlights))

  const existingHighlights = document.getElementsByClassName("appended");
  const textLayer = document.getElementsByClassName("textLayer")[0]; // Ensure this is defined

  console.log(existingHighlights, textLayer);

  Array.from(existingHighlights).forEach((match) => {
    console.log("inside existing highlights");

    const box = document.createElement("div");

    // Apply inline styles instead of using a class
    box.style.position = "absolute";
    box.style.border = "2px solid red"; // Style your box
    box.style.pointerEvents = "none"; // Allow clicks to pass through
    box.classList.add("tiktok");

    // Calculate position and size of the box using getBoundingClientRect
    const rect = match.getBoundingClientRect();
    box.style.left = `${rect.left}px`;
    box.style.top = `${rect.top}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;

    textLayer.appendChild(box);
  });

  // matches.forEach((match) => {
  //   const box = document.createElement("div");
  //   box.className = "highlight-box";
  //   box.style.position = "absolute";
  //   box.style.border = "2px solid red"; // Style your box
  //   box.style.pointerEvents = "none"; // Allow clicks to pass through

  //   // Calculate position and size of the box
  //   const rect = match.rect; // Contains the position of the found text
  //   box.style.left = `${rect[0]}px`;
  //   box.style.top = `${rect[1]}px`;
  //   box.style.width = `${rect[2] - rect[0]}px`;
  //   box.style.height = `${rect[3] - rect[1]}px`;

  //   textLayer.appendChild(box);
  // });
}

// Loading document.
const loadingTask = pdfjsLib.getDocument({
  url: DEFAULT_URL,
  cMapUrl: CMAP_URL,
  cMapPacked: CMAP_PACKED,
  enableXfa: ENABLE_XFA,
});

const pdfDocument = await loadingTask.promise;
// Document loaded, specifying document for the viewer and
// the (optional) linkService.
pdfSinglePageViewer.setDocument(pdfDocument);

pdfLinkService.setDocument(pdfDocument, null);
