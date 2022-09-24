/*
 * Copyright 2022 Patrick L. Branson
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

import './Select.css';

import React, { useEffect, useRef, useState } from 'react';

export type SelectOption = {
  label: string;
  value: string | number;
};

type MultipleSelectProps = {
  multiple: true;
  value: SelectOption[];
  onChange: (value: SelectOption[]) => void;
};

type SingleSelectProps = {
  multiple?: false;
  value?: SelectOption;
  onChange: (value: SelectOption | undefined) => void;
};

type SelectProps = {
  options: SelectOption[];
} & (SingleSelectProps | MultipleSelectProps);

const Select = ({
  multiple,
  value,
  onChange,
  options
}: SelectProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const containerReference = useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const clearOptions = () => {
    multiple ? onChange([]) : onChange(undefined);
  };

  const selectOption = (option: SelectOption) => {
    if (multiple) {
      if (value.includes(option)) {
        onChange(value.filter(opt => opt !== option));
      } else {
        onChange([...value, option]);
      }
    } else {
      if (option !== value) {
        onChange(option);
      }
    }
  };

  const isOptionSelected = (option: SelectOption) => {
    return multiple ? value.includes(option) : option === value;
  };

  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.target != containerReference.current) {
        return;
      }

      switch (event.code) {
        case 'Enter':
        case 'Space':
          setIsOpen(previous => !previous);
          if (isOpen) {
            selectOption(options[highlightedIndex]);
          }
          break;
        case 'ArrowUp':
        case 'ArrowDown': {
          if (isOpen) {
            setIsOpen(true);
            break;
          }

          const newValue =
            highlightedIndex + (event.code === 'ArrowDown' ? 1 : -1);
          if (newValue >= 0 && newValue < options.length) {
            setHighlightedIndex(newValue);
          }
          break;
        }
        case 'Escape':
          setIsOpen(false);
          break;
      }
    };

    containerReference.current?.addEventListener('keydown', handler);

    return () => {
      containerReference.current?.removeEventListener('keydown', handler);
    };
  }, [isOpen, highlightedIndex, options]);

  return (
    <div
      ref={containerReference}
      onBlur={() => setIsOpen(false)}
      onClick={() => setIsOpen(previous => !previous)}
      tabIndex={0}
      className={'container'}
    >
      <span className={'value'}>
        {multiple
          ? value.map(val => (
              <button
                key={val.value}
                onClick={event => {
                  event.stopPropagation();
                  selectOption(val);
                }}
                className={'option-badge'}
              >
                {val.label}
                <span className="remove-btn">&times;</span>
              </button>
            ))
          : value?.label}
      </span>
      <button
        onClick={event => {
          event.stopPropagation();
          clearOptions();
        }}
        className={'clear-btn'}
      >
        &times;
      </button>
      <div className="divider"></div>
      <div className="caret"></div>
      <ul className={`options ${isOpen ? 'show' : ''}`}>
        {options.map((option, index) => (
          <li
            onClick={event => {
              event.stopPropagation();
              selectOption(option);
              setIsOpen(false);
            }}
            onMouseEnter={() => setHighlightedIndex(index)}
            key={option.value}
            className={`${'option'} ${
              isOptionSelected(option) ? 'selected' : ''
            } ${index === highlightedIndex ? 'highlighted' : ''}`}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Select;
