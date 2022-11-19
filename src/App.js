import { useCallback, useEffect, useState } from 'react';

import fiveCharWords from './fiveCharWords';

import './App.css';

function App() {
  const [inputWord, setInputWord] = useState('');
  const [enteredWords, setEnteredWords] = useState([]);
  const [filteredWords, setFilteredWords] = useState([]);
  const [inputClassName, setInputClassName] = useState('input');
  const [allFiveCharsWordsStats, setAllFiveCharsWordsStats] = useState([]);
  const [filteredFiveCharsWordsStats, setFilteredFiveCharsWordsStats] = useState([]);
  const [selectedChars, setSelectedChars] = useState([]);

  const handleToggleCharSelect = useCallback((selectedChar) => {
    if (selectedChars.includes(selectedChar)) {
      setSelectedChars(selectedChars.filter(char => char !== selectedChar));
    } else {
      setSelectedChars([...selectedChars, selectedChar]);
    };
  }, [selectedChars]);

  const classForCharInWords = useCallback((statChar) => {
    if (selectedChars.includes(statChar)) {
      return 'selectedChar';
    };
    let included = false;
    enteredWords.forEach((enteredWord) => {
      enteredWord.forEach((charData) => {
        if (charData.char === statChar) {
          included = true;
        };          
      });
    });
    if (included) {
      return 'includedChar';
    }
    return '';
  }, [enteredWords, selectedChars]);

  const handleInputChange = (word) => {
    setInputWord(
      (word.trim().toUpperCase().match(/[А-ЩЫ-Я]/gi) || []).join('').slice(0, 5)
    );
  };

  const handleChangeCharStatus = useCallback((enteredWordIndex, enteredCharIndex) => {
    setEnteredWords(
      enteredWords.map((enteredWord, i) => {
        if (i === enteredWordIndex) {
          return enteredWord.map((charData, j) => {
            if (j === enteredCharIndex) {
              return {char: charData.char, status: charData.status === 2 ? 0 : charData.status + 1};
            }
            return charData;
          })
        }
        return enteredWord;
      })
    );
  }, [enteredWords]);

  const handleSubmitWord = useCallback((word) => {
    if (enteredWords.length < 6 && word.length === 5) {
      setEnteredWords([...enteredWords, word.split('').map((char) => ({char, status: 2}))]);
      setSelectedChars([]);
    } else {
      setInputClassName('inputError');
      setTimeout(() => setInputClassName('input'), 2000);
    }
  }, [enteredWords]);

  const handleRemove = useCallback(() => {
    if (inputWord.length > 0) {
      setInputWord('');
    } else if (enteredWords.length > 0) {
      const res = enteredWords.slice(0, enteredWords.length - 1);
      setEnteredWords(res);
    }    
  }, [enteredWords, inputWord]);

  useEffect(() => {
    const charsStatsForWordsWithFiveChars = new Map();
    fiveCharWords.forEach(word => {
      for (var i = 0; i < word.length; i++) {
        const char = word.charAt(i);
        if (!charsStatsForWordsWithFiveChars.get(char)) {
          charsStatsForWordsWithFiveChars.set(char, 1);
        } else {
          charsStatsForWordsWithFiveChars.set(char, charsStatsForWordsWithFiveChars.get(char) + 1);
        };
      }
    });
    setAllFiveCharsWordsStats([...charsStatsForWordsWithFiveChars.entries()].sort((a, b) => b[1] - a[1]));
  }, []);

  useEffect(() => {
    const filteredWordsChars = new Map();
    filteredWords.forEach(filteredWord => {
      for (var i = 0; i < filteredWord.length; i++) {
        const char = filteredWord.charAt(i);
        if (!filteredWordsChars.get(char)) {
          filteredWordsChars.set(char, 1);
        } else {
          filteredWordsChars.set(char, filteredWordsChars.get(char) + 1);
        };
      }
    });
    setFilteredFiveCharsWordsStats([...filteredWordsChars.entries()].sort((a, b) => b[1] - a[1]));
  }, [filteredWords]);
  
  useEffect(() => {
    const isRightWord = (word) => {
      let rightWord = true;
      enteredWords.forEach((enteredWord) => {
        enteredWord.forEach((charData, j) => {
          if (charData.status === 0) {
            rightWord = rightWord && !word.includes(charData.char);
          } else if (charData.status === 1) {
            rightWord = rightWord && word.includes(charData.char) && (word[j] !== charData.char);
          } else if (charData.status === 2) {
            rightWord = rightWord && (word[j] === charData.char);
          }
        })
      })
      return rightWord;
    };

    const hasSelectedChars = (word) => {
      if (selectedChars.length === 0) {
        return true;
      };

      let included = true;
      selectedChars.forEach(selectedChar => {
        if (!word.includes(selectedChar)) {
          included = false;
        }
      })

      return included;
    };

    const filteredWords = fiveCharWords.filter(word => isRightWord(word)).filter(word => hasSelectedChars(word));
    setFilteredWords(filteredWords);
  }, [enteredWords, selectedChars]);

  const EnteredWordWithButtons = useCallback(({ word, wordIndex }) => {
    return (
      <div className="enteredWord">
        {word.map((char, i) => (
          <button
            key={`${wordIndex}-${i}`}
            className={`button${char.status}`}
            onClick={() => handleChangeCharStatus(wordIndex, i)}>
              {char.char}
          </button>
        ))}
      </div>
    )
  }, [handleChangeCharStatus]);

  return (
    <div className="App">
      <header className="App-header">
        <form className="form" onSubmit={(e) => {e.preventDefault();handleSubmitWord(inputWord);setInputWord('');}}>
          <button className="removeButton" onClick={handleRemove} type="button">–</button>
          <input className={inputClassName} onChange={(e) => handleInputChange(e.target.value)} type="text" value={inputWord} autoFocus />
          <button className="addButton" type="submit">+</button>
        </form>
        {enteredWords.map(
          (word, wordIndex) => 
            <EnteredWordWithButtons word={word} wordIndex={wordIndex} key={`entered-${wordIndex}`} />
        )}
        <div className="container">
            <div className="subHeader">
              <p><b>MATCHES ({filteredWords.length})</b></p>
            </div>
            <div className="subHeader">
              <p className="pointer" onClick={() => setSelectedChars([])}><b>STATS FILTERED</b></p>
            </div>
            <div className="subHeader">
              <p className="pointer" onClick={() => setSelectedChars([])}><b>STATS ALL</b></p>
            </div>
        </div>
        <div className="container">
          <div className="left">
            { filteredWords.map(
                word => <p onClick={() => handleSubmitWord(word)} key={`w-${word}`}>{word}</p>
              )
            }
          </div>
          <div className="center">
            {
              filteredFiveCharsWordsStats.map(
                charData =>
                  <p
                    className={classForCharInWords(charData[0])}
                    onClick={() => handleToggleCharSelect(charData[0])}
                    key={`f-${charData[0]}`}>
                      {charData[0]} {charData[1]}
                  </p>
              )
            }
          </div>
          <div className="right">
            {
              allFiveCharsWordsStats.map(
                charData =>
                  <p
                    className={classForCharInWords(charData[0])}
                    onClick={() => handleToggleCharSelect(charData[0])}
                    key={`a-${charData[0]}`}>
                      {charData[0]} {charData[1]}
                  </p>
              )
            }
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
