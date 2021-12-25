import { Options } from "../options/options"
import { Space } from "../SpacesManager"

export type AppData = {
  spaces: Space[];
  options: Options;
}

export class DataLoader {
  public getCurrentState (): AppData {
    return {
      spaces: window.spacesManager.spaces,
      options: window.options
    }
  }

  public verifyIntegrity (object: AppData) {
    if (object.spaces === undefined || !(object.spaces instanceof Array)) {
      throw new Error('Incorrect spaces object')
    }
    if (object.spaces.length) {
      for (const space of object.spaces) {
        if (!['currency', 'name', 'sessions'].every(prop => prop in space)) {
          throw new Error('Some spaces are missing properties')
        }
      }
    }
    if (object.options ===  undefined) {
      throw new Error('Options are missing from the data')
    }
    if (!object.options.exchangeViewOptions || object.options.exchangeViewOptions.showWallet === undefined
      || !Object.keys(window.optionsManager.default.sessionViewOptions).every(prop => prop in object.options.sessionViewOptions))
    {
      throw new Error('Some properties are missing from the option data')
    }
  }

  public loadData (data: AppData, save = true) {
    window.optionsManager.load(data.options)
    window.spacesManager.loadSpaces(data.spaces)
    if (save) {
      window.spacesManager.save()
      window.optionsManager.save()
    }
  }
}

declare global {
  interface Window {
    dataLoader: DataLoader
  }
}

window.dataLoader = new DataLoader()