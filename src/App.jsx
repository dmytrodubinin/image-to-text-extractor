import { useState, useEffect } from "react";
import languages from "./languages";
import ProgressBar from "./components/ProgressBar";
import Tesseract from "tesseract.js";
import {
  BsImage,
  BsFillSunFill,
  BsFillMoonStarsFill,
  BsClipboard,
  BsClipboardCheck,
} from "react-icons/bs";
import { RiListSettingsFill } from "react-icons/ri";
import { SiConvertio } from "react-icons/si";
import { BiErrorAlt } from "react-icons/bi";
import { CgFormatText } from "react-icons/cg";
import { FaCloudUploadAlt } from "react-icons/fa";

const getTheme = () => {
  let theme = "light-theme";
  if (localStorage.getItem("theme")) {
    theme = localStorage.getItem("theme");
  }
  return theme;
};

function App() {
  const [theme, setTheme] = useState(getTheme());
  const [imagePath, setImagePath] = useState("");
  const [formatText, setFormatText] = useState(false);
  const [userLanguage1, setUserLanguage1] = useState(languages[0].code);
  const [userLanguage2, setUserLanguage2] = useState("no language");
  const [status, setStatus] = useState({
    status: "Click convert to start recognition",
    progress: 0,
  });
  const [text, setText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const setUserLanguages = (lang1, lang2) => {
    if (lang2 !== "no language") {
      return `${lang1}+${lang2}`;
    }
    return lang1;
  };

  const toggleTheme = () => {
    if (theme === "light-theme") {
      setTheme("dark-theme");
    } else {
      setTheme("light-theme");
    }
  };

  const copyToClipboard = () => {
    if (formatText) {
      navigator.clipboard.writeText(text);
    } else {
      const clearText = text.replace(/\s+/g, " ").trim();
      navigator.clipboard.writeText(clearText);
    }
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  // load theme
  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // show error message after timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (
        status.status !== "Click convert to start recognition" &&
        status.status !== "recognizing text" &&
        status.progress !== 1
      ) {
        setStatus({
          status: "Unexpected error. Please try again",
          progress: 0,
        });
      }
    }, 30000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [status.status]);

  // change image
  const imageChange = (e) => {
    // set new image
    setImagePath(URL.createObjectURL(e.target.files[0]));

    // reset recognition progress
    setStatus({
      status: "Click convert to start recognition",
      progress: 0,
    });
  };

  // start recognize
  const handleClick = () => {
    Tesseract.recognize(
      imagePath,
      setUserLanguages(userLanguage1, userLanguage2),
      {
        logger: (m) => {
          setStatus({ status: m.status, progress: m.progress });
        },
      }
    )
      .catch((err) => {
        console.error(err);
      })
      .then(({ data: { text } }) => {
        setText(text);
      });
  };

  return (
    <main className="app">
      <nav>
        <div className="container container--nav">
          <CgFormatText fontSize="45px" />
          <h1>Image To Text Converter</h1>
          <button className="btn--toggle-theme" onClick={toggleTheme}>
            {theme === "light-theme" ? (
              <BsFillMoonStarsFill />
            ) : (
              <BsFillSunFill />
            )}
          </button>
        </div>
      </nav>
      <div className="container mt-4">
        <div className="app__image-upload">
          <div className="step-descr">STEP 1: Upload file</div>
          {imagePath ? (
            <img src={imagePath} className="app__image-preview" alt="logo" />
          ) : (
            <BsImage className="step-icon" />
          )}

          <label className="btn">
            <input type="file" onChange={imageChange} />
            <FaCloudUploadAlt fontSize="20px" />
            &nbsp; Upload image
          </label>
        </div>

        <div className="app__options">
          <div className="step-descr">STEP 2: Select settings</div>
          <RiListSettingsFill className="step-icon" />
          <label className="form-control">
            <input
              type="checkbox"
              name="checkbox"
              onChange={() => setFormatText(!formatText)}
            />
            Retain Image Formatting
          </label>
          <div className="languages">
            <p className="languages__descr">
              Choose 1 or 2 languages that are used in your image:
            </p>
            <div className="languages__select">
              <select
                className="app__options-select"
                onChange={(e) => setUserLanguage1(e.target.value)}
              >
                {languages.map((lang, index) => {
                  return (
                    <option value={lang.code} key={index}>
                      {lang.lang}
                    </option>
                  );
                })}
              </select>
              <select
                className="app__options-select"
                onChange={(e) => setUserLanguage2(e.target.value)}
              >
                <option value="no language" key="0">
                  no language
                </option>
                {languages.map((lang, index) => {
                  return (
                    <option value={lang.code} key={index + 1}>
                      {lang.lang}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        <div className="app__convert">
          <div className="step-descr">STEP 3: Convert</div>
          {imagePath ? (
            <ProgressBar status={status} />
          ) : (
            <SiConvertio className="step-icon" />
          )}
          <button
            className="btn btn--handle"
            onClick={handleClick}
            disabled={imagePath ? false : true}
          >
            {imagePath ? (
              <CgFormatText fontSize="20px" />
            ) : (
              <BiErrorAlt fontSize="20px" />
            )}
            &nbsp; convert
          </button>
        </div>
      </div>
      <div className="container mt-2">
        {status.status === "recognizing text" && status.progress === 1 ? (
          <div className="app__result">
            <div className="app__result--copy" onClick={copyToClipboard}>
              {isCopied ? <BsClipboardCheck /> : <BsClipboard />}
            </div>
            <h2>Extracted Text:</h2>
            {formatText ? (
              <pre className="text">{text}</pre>
            ) : (
              <div className="text">{text}</div>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default App;
