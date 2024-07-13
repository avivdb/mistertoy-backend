
import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

export const toyService = {
    query,
    getById,
    remove,
    save
}

const toys = utilService.readJsonFile('data/toy.json')

function query(filterBy = { txt: '', maxPrice: '', inStock: '', labels: [], sortBy: '' }) {
    // console.log('Received Filter:', filterBy);
    const regex = new RegExp(filterBy.txt, 'i');
    let toysToReturn = toys.filter(toy => regex.test(toy.name));

    if (filterBy.maxPrice) {
        toysToReturn = toysToReturn.filter(toy => toy.price <= filterBy.maxPrice);
    }

    if (filterBy.labels && filterBy.labels.length > 0) {
        toysToReturn = toysToReturn.filter(toy => filterBy.labels.some(label => toy.labels.includes(label)))
    }

    if (filterBy.inStock) {
        toysToReturn = toysToReturn.filter(toy => toy.inStock.toString() === filterBy.inStock)
    }

    switch (filterBy.sortBy) {
        case 'name':
            toysToReturn.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price':
            toysToReturn.sort((a, b) => a.price - b.price)
            break;
        case 'created':
            toysToReturn.sort((a, b) => a.created - b.created)
            break;
        default:
            console.log('Invalid sortBy parameter:', filterBy.sortBy)
    }
    // console.log('Sorted Toys:', toysToReturn);
    return Promise.resolve(toysToReturn);
}

function getById(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    return Promise.resolve(toy)
}

function remove(toyId) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No Such Toy')
    const toy = toys[idx]
    toys.splice(idx, 1)
    return _saveToysToFile()
}

function save(toy) {
    if (toy._id) {
        const toyToUpdate = toys.find(currToy => currToy._id === toy._id);
        toyToUpdate.name = toy.name;
        toyToUpdate.price = toy.price;
        toyToUpdate.inStock = toy.inStock;
        toyToUpdate.labels = toy.labels;
        toy = toyToUpdate;
    } else {
        toy._id = utilService.makeId()
        toys.push(toy)
    }

    return _saveToysToFile().then(() => toy)
}


function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toy.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to toys file', err)
                return reject(err)
            }
            resolve()
        })
    })
}
