const exchangeBtn = document.getElementById("exchange");
const leftLang = document.getElementById("leftLang");
const rightLang = document.getElementById("rightLang");
const translateBtn = document.getElementById("translate");
const arrangeBtn = document.getElementById("arrange");
const newlineBtn = document.getElementById("newline");
const punctuationBtn = document.getElementById("punctuation");
const copyBtn = document.getElementById("copy");
const leftArea = document.getElementById("leftArea");
const rightArea = document.getElementById("rightArea");
const dummyArea = document.getElementById("dummyArea");

const defaultHeight = 250;
const language_ = localStorage.getItem("language");
let language = language_ != null ? JSON.parse(language_) : true;
let newlineFlag = false;
let punctuation = false;
let timer = 0;

function dummyText(text) {
  return (
    text
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(\s) /g, "$1&nbsp")
      .replace(/"/g, "&quot;")
      .replace(/\n/g, "<br>") + "<br>"
  );
}

function autoChangHeight() {
  dummyArea.innerHTML = dummyText(rightArea.value);
  const rightHeight = dummyArea.offsetHeight;
  dummyArea.innerHTML = dummyText(leftArea.value);
  const leftHeight = dummyArea.offsetHeight;
  if (Math.max(leftHeight, rightHeight) > defaultHeight) {
    if (leftHeight > rightHeight) {
      leftArea.style.height = leftHeight + "px";
      rightArea.style.height = leftHeight + "px";
    } else {
      leftArea.style.height = rightHeight + "px";
      rightArea.style.height = rightHeight + "px";
    }
  } else {
    leftArea.style.height = defaultHeight + "px";
    rightArea.style.height = defaultHeight + "px";
  }
}

function copyRightArea() {
  rightArea.selectionStart = 0;
  rightArea.selectionEnd = rightArea.value.length;
  rightArea.focus();
  let result = document.execCommand("copy");
  rightArea.blur();
}

function translate() {
  let url =
    "https://script.google.com/macros/s/AKfycbxeorlk4gHwEmOz0K56-vgMf3BNQ9jx_Af8_EWAXjZSpyQYoqI/exec";
  url += `?text=${encodeURIComponent(leftArea.value.replace(/\n/g, ""))}`;
  if (language) {
    url += "&source=en&target=ja";
  } else {
    url += "&source=ja&target=en";
  }
  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      let result = json.text;
      if (json.code == 200) {
        if (newlineFlag) {
          result = result
            .replace(/(。|．)([^）」])/g, "$1\n$2")
            .replace(/\. ([A-Z])/g, ". \n$1");
        }
      }
      rightArea.value = result;
      autoChangHeight();
    });
}

window.onload = function () {
  if (!language) {
    const tmp = leftLang.innerHTML;
    leftLang.innerHTML = rightLang.innerHTML;
    rightLang.innerHTML = tmp;
  }

  exchangeBtn.addEventListener(
    "click",
    function () {
      language = !language;
      localStorage.setItem("language", JSON.stringify(language));
      const tmp = leftLang.innerHTML;
      leftLang.innerHTML = rightLang.innerHTML;
      rightLang.innerHTML = tmp;
      console.log(rightArea.value.length);
      if (rightArea.value.length > 0) {
        leftArea.value = rightArea.value;
      }
    },
    false
  );

  translateBtn.addEventListener(
    "click",
    function () {
      console.log(leftArea.value.length);
      if (leftArea.value.length < 10000) {
        translate();
      } else {
        alert("翻訳する文字列が長過ぎます．");
      }
    },
    false
  );

  arrangeBtn.addEventListener(
    "click",
    function () {
      newlineFlag = false;
      if (language) {
        leftArea.value = leftArea.value
          .replace(/(^\s+|-\s)/g, "")
          .replace(/\n/g, " ")
          .replace(/([\.\?!]) +/g, "$1 ")
          .replace(/(\s)+/g, "$1");
        leftArea.value = leftArea.value
          .replace(/(“|”)/g, '"')
          .replace(/’/g, "'");
      } else {
        leftArea.value = leftArea.value
          .replace(/^(\s| )+/, "")
          .replace(/\s+/g, "")
          .replace(/\(/g, "（")
          .replace(/\)/g, "）")
          .replace(/\.([^a-zA-Z0-9]|$)/g, "．$1");
      }
      autoChangHeight();
    },
    false
  );

  newlineBtn.addEventListener(
    "click",
    function () {
      newlineFlag = true;
      if (language) {
        leftArea.value = leftArea.value.replace(
          /([\.\?!]) ([A-Z\("'])/g,
          "$1 \n$2"
        );
      } else {
        leftArea.value = leftArea.value.replace(
          /([．。？！])([^）」』])/g,
          "$1\n$2"
        );
      }
      autoChangHeight();
    },
    false
  );

  punctuationBtn.addEventListener(
    "click",
    function () {
      punctuation = !punctuation;
      if (punctuation) {
        leftArea.value = leftArea.value
          .replace(/．/g, "。")
          .replace(/，/g, "、");
      } else {
        leftArea.value = leftArea.value
          .replace(/。/g, "．")
          .replace(/、/g, "，");
      }
      autoChangHeight();
    },
    false
  );

  copyBtn.addEventListener(
    "click",
    function () {
      copyRightArea();
    },
    false
  );

  leftArea.addEventListener(
    "input",
    function () {
      autoChangHeight();
    },
    false
  );
};

window.onresize = function () {
  autoChangHeight();
};
