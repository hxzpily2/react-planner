import PropertyColor from './properties/property-color';
import PropertyEnum from './properties/property-enum';
import PropertyString from './properties/property-string';
import PropertyNumber from './properties/property-number';
import PropertyLengthMeasure from './properties/property-lenght-measure';
import PropertyToggle from './properties/property-toggle';
import PropertyCheckbox from './properties/property-checkbox';
import PropertyHidden from './properties/property-hidden';
import PropertyReadOnly from './properties/property-read-only';

import {UNIT_CENTIMETER} from '../constants';

export default class Catalog {

  constructor(unit = UNIT_CENTIMETER) {
    this.elements = {};
    this.categories = {root: {name: 'root', label: '/', elements: [], categories: []}};
    this.propertyTypes = {};
    this.unit = unit;

    this.registerMultiplePropertyType([
      ['color', PropertyColor, PropertyColor],
      ['enum', PropertyEnum, PropertyEnum],
      ['string', PropertyString, PropertyString],
      ['number', PropertyNumber, PropertyNumber],
      ['length-measure', PropertyLengthMeasure, PropertyLengthMeasure],
      ['toggle', PropertyToggle, PropertyToggle],
      ['checkbox', PropertyCheckbox, PropertyCheckbox],
      ['hidden', PropertyHidden, PropertyHidden],
      ['read-only', PropertyReadOnly, PropertyReadOnly]
    ]);
  }

  getElement(type) {
    if (this.hasElement(type)) {
      return this.elements[type];
    }
    throw new Error(`Element ${type} does not exist in catalog`);
  }

  getCategory(categoryName) {
    if (this.hasCategory(categoryName)) {
      return this.categories[categoryName];
    }
    throw new Error(`Category ${categoryName} does not exist in catalog`);
  }

  getPropertyType(type) {
    if (this.propertyTypes.hasOwnProperty(type)) {
      return this.propertyTypes[type];
    }
    throw new Error(`Element ${type} does not exist in catalog`);
  }

  registerElement(json) {
    json.properties = json.properties || {};
    if (this.validateElement(json)) {
      this.elements[json.name] = json;
      this.categories.root.elements.push(this.elements[json.name]);
    }
  }

  registerPropertyType(propertyType, propertyViewer, propertyEditor) {
    this.propertyTypes[propertyType] = {
      type: propertyType,
      Viewer: propertyViewer,
      Editor: propertyEditor
    }
  }

  registerMultiplePropertyType(propertyTypeArray) {
    propertyTypeArray.forEach(el => this.registerPropertyType(...el));
  }

  validateElement(json) {
    if (!json.hasOwnProperty('name')) throw new Error(`Element not valid`);

    let name = json.name;
    if (!json.hasOwnProperty('prototype')) throw new Error(`Element ${name} doesn't have prototype`);

    if (!json.hasOwnProperty('info')) throw new Error(`Element ${name} doesn't have info`);
    if (!json.info.hasOwnProperty('tag')) throw new Error(`Element ${name} doesn't have tag`);
    if (!json.info.hasOwnProperty('group')) throw new Error(`Element ${name} doesn't have group`);
    if (!json.info.hasOwnProperty('description')) throw new Error(`Element ${name} doesn't have description`);
    if (!json.info.hasOwnProperty('image')) throw new Error(`Element ${name} doesn't have image`);

    if (!json.hasOwnProperty('render2D')) throw new Error(`Element ${name} doesn't have render2D handler`);
    if (!json.hasOwnProperty('render3D')) throw new Error(`Element ${name} doesn't have render3D handler`);
    if (!json.hasOwnProperty('properties')) throw new Error(`Element ${name} doesn't have properties`);

    for (let propertyName in json.properties) {
      let propertyConfigs = json.properties[propertyName];
      if (!propertyConfigs.hasOwnProperty('type')) throw new Error(`Element ${name}, Property ${propertyName} doesn't have type`);
      if (!propertyConfigs.hasOwnProperty('defaultValue')) throw new Error(`Element ${name}, Property ${propertyName} doesn't have defaultValue`);
    }

    return true;
  }

  hasElement(type) {
    return this.elements.hasOwnProperty(type);
  }

  registerCategory(name, label) {
    if (this.validateCategory(name, label)) {
      this.categories[name] = {name, label, categories: [], elements: []};
      this.categories.root.categories.push(this.categories[name]);
    }
  }

  addToCategory(name, child) {
    if (this.hasElement(child.name)) {
      this.categories[name].elements.push(child);
      this.categories.root.elements.splice(this.categories.root.elements.indexOf(child), 1);
    } else if (this.hasCategory(child.name)) {
      this.categories[name].categories.push(child);
      this.categories.root.categories.splice(this.categories.root.categories.indexOf(child), 1);
    } else {
      throw new Error(`child ${child} is either category nor element`);
    }
  }

  categoryHasElement(categoryName, elementName) {
    let i;
    for (i = 0; i < this.categories[categoryName].elements.length; i++) {
      if (this.categories[categoryName].elements[i].name === elementName) {
        return true;
      }
    }

    return false;
  }

  validateCategory(name, label) {
    if (name === "") {
      throw new Error(`Category has empty name`);
    } else if (this.categories[name]) {
      throw new Error(`Category has already been registered`);
    }

    return true;
  }

  hasCategory(categoryName) {
    return this.categories.hasOwnProperty(categoryName);
  }

}
