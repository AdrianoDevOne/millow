import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Config
import config from './config.json';

function App() {
  const [provider, setProvider] = useState(null)
  const [escrow, setEscrow] = useState(null)

  const [account, setAccount] = useState(null)

  const [homes, setHomes] = useState([])
  const [home, setHome] = useState({})
  const [toggle, setToggle] = useState(false);

  async function connectMetaMask() {
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(provider)
        const network = await provider.getNetwork()

        // Request account access if needed
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        setAccount(accounts[0]);

        window.ethereum.on('accountsChanged', function (accounts) {
          setAccount(accounts[0]);
        });

        const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider)
        const totalSupply = await realEstate.totalSupply()
        const homes = []

        console.log(totalSupply.toString())
        for (var i = 1; i < totalSupply; i++) {
          const uri = await realEstate.tokenURI(i)
          const response = await fetch(uri)
          const metadata = await response.json()
          homes.push(metadata)
        }

        setHomes(homes)

        const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider)
        setEscrow(escrow)

      } catch (error) {
        console.error(error);
      }
    } else {
      console.error('MetaMask is not installed. Please install MetaMask and try again.');
    }
  }

  useEffect(() => {
    connectMetaMask();
  }, []);

  const togglePop = (home) => {
    setHome(home)
    toggle ? setToggle(false) : setToggle(true);
  }

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />
      <div className='cards__section'>

        <h3>Homes for you</h3>
        <hr />

        <div className='cards'>
          {homes.map((home, index) => (
            <div className='card' key={index} onClick={() => togglePop(home)}>
              <div className='card__image'>
                <img src={home.image} alt="Home" />
              </div>
              <div className='card__info'>
                <h4>{home.attributes[0].value} ETH</h4>
                <p>
                  <strong>{home.attributes[2].value}</strong> bds |
                  <strong>{home.attributes[3].value}</strong> ba |
                  <strong>{home.attributes[4].value}</strong> sqft
                </p>
                <p>{home.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
