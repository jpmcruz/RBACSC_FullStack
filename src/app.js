App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
//      window.alert("Please asdconnect to Metamask.")
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = web3.eth.accounts[0]
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const rbacSC = await $.getJSON('RBACSC.json')
    App.contracts.RBACSC = TruffleContract(rbacSC)
    App.contracts.RBACSC.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    App.rbacSC = await App.contracts.RBACSC.deployed()
  },

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }

    // Render Account
    $('#account').html(App.account)

    // Render RBACSC
    await App.renderOrganizationName()
    await App.displayUser()
    await App.displayEndorsee()
  },

  renderOrganizationName: async () => {
    // Load details of organization name and owner from the blockchain
    //const organizationName = await App.rbacSC.organizationName()
    const ownerDetails = await App.rbacSC.getOwner();
    var result = ownerDetails.toString().split(",");
//    const organizationName = getOwner.toString().split(",");
    $("#orgName").text(result[1]);
    // var ownerDetails = await App.rbacSC.users(0)
    // var result = ownerDetails.toString().split(",");
    $("#ownerAddress").text(result[0]);
    // $("#ownerRole").text(result [1]);
    // $("#ownerNotes").text(result [2]);
    var ownerDate = new Date(result[2]*1000);
    $("#ownerSince").text(ownerDate.toLocaleString());
    var getNumOfUsers = await App.rbacSC.getNoOfUsers()
    var getNumOfEndorsees = await App.rbacSC.getNoOfEndorsees()
    $("#numberOfUsers").text(getNumOfUsers);
    $("#numberOfEndorsees").text(getNumOfEndorsees);
    },

//add confirm and reject errors.
    addUser: async () => {
    try {
         var funcUserAddress = $("#funcUserAddress").val();
         var funcUserRole = $("#funcUserRole").val();
         var funcUserNotes = $("#funcUserNotes").val();
         await App.rbacSC.addUser(funcUserAddress, funcUserRole, funcUserNotes);
         window.location.reload()}
    catch (error) {
            if (error.code === 4001) {
              window.alert("MetaMask Tx Signature: User denied transaction signature.")
            } else if (error.code === -32603){
              window.alert("Changes not saved, only the owner of smart contract can add users.")
            }
    }
    },

    removeUser: async () => {
        try {
         var remUserAddress = $("#remUserAddress").val();
         await App.rbacSC.removeUser(remUserAddress);
         window.location.reload()
         window.alert("User removed successfully.")
       }
         catch (error) {
                 if (error.code === 4001) {
                   window.alert("MetaMask Tx Signature: User denied transaction signature.")
                 } else if (error.code === -32603){
                   window.alert("Changes not saved, only the owner can remove a user.")
                 }
         }
    },

    addEndorsee: async () => {
        try {
          var funcEndorseeAddress = $("#funcEndorseeAddress").val();
          var funcEndorseeNotes = $("#funcEndorseeNotes").val();
          await App.rbacSC.addEndorsee(funcEndorseeAddress, funcEndorseeNotes);
          window.location.reload()}
        catch (error) {
                if (error.code === 4001) {
                  window.alert("MetaMask Tx Signature: User denied transaction signature.")
                } else if (error.code === -32603){
                  window.alert("Changes not saved, only a user can endorse.")
                }
        }
    },

    removeEndorsee: async () => {
        try {
        var remEndorseeAddress = $("#remEndorseeAddress").val();
        await App.rbacSC.removeEndorsee(remEndorseeAddress);
        window.location.reload()
        window.alert("Endorsee removed successfully.")
      }
        catch (error) {
                if (error.code === 4001) {
                  window.alert("MetaMask Tx Signature: User denied transaction signature.")
                } else if (error.code === -32603){
                  window.alert("Changes not saved, only an endorser can remove its endorsee.")
                }
        }
    },

    displayUser: async () => {
      try {
         var userCounterBox = parseInt($("#userCounter").val());
         var userAddress = await App.rbacSC.userAccounts(userCounterBox);
         var userDetails = await App.rbacSC.users(userAddress)
         var result = userDetails.toString().split(",");
         $("#userAddress").text(userAddress);
         $("#userRole").text(result[0]);
         $("#userNotes").text(result[1]);
         var myDate = new Date(result[2]*1000);
         $("#userSince").text(myDate.toLocaleString());
       } catch (error) {
         if (userCounterBox == 0){

         }else {
      window.alert("User does not exist")
         }
       }
    },

    displayUserPlus: async () => {
      try {
        var userCounterBox = parseInt($("#userCounter").val()) + 1;
        var userAddress = await App.rbacSC.userAccounts(userCounterBox);
        var userDetails = await App.rbacSC.users(userAddress)
        var result = userDetails.toString().split(",");
        $("#userAddress").text(userAddress);
        $("#userRole").text(result[0]);
        $("#userNotes").text(result[1]);
        var myDate = new Date(result[2]*1000);
        $("#userSince").text(myDate.toLocaleString());
        document.getElementById('userCounter').value =  userCounterBox;
      } catch (error) {
        window.alert("Last user reached.")
      }
    },

    displayUserMinus: async () => {
      try {
        var userCounterBox = parseInt($("#userCounter").val()) - 1;
        var userAddress = await App.rbacSC.userAccounts(userCounterBox);
        var userDetails = await App.rbacSC.users(userAddress)
        var result = userDetails.toString().split(",");
        $("#userAddress").text(userAddress);
        $("#userRole").text(result[0]);
        $("#userNotes").text(result[1]);
        var myDate = new Date(result[2]*1000);
        $("#userSince").text(myDate.toLocaleString());
        document.getElementById('userCounter').value =  userCounterBox;
      } catch (error) {
        window.alert("First user reached.")
      }
    },

    displayEndorsee: async () => {
        try {
           var endorseeCounterBox = parseInt($("#endorseeCounter").val());
           var endorseeAddress = await App.rbacSC.endorseeAccounts(endorseeCounterBox)
           var endorseeDetails = await App.rbacSC.endorsees(endorseeAddress)
           var result = endorseeDetails.toString().split(",");
           $("#endorseeAddress").text(endorseeAddress);
           $("#endorserAddress").text(result[0]);
           $("#endorseeNotes").text(result[1]);
           var myDate = new Date(result[2]*1000);
           $("#endorseeSince").text(myDate.toLocaleString());
         } catch (error) {
           if (endorseeCounterBox == 0){
           }else {
           window.alert("Endorsee does not exist")
           }
         }
    },

    displayEndorseePlus: async () => {
        try {
          var endorseeCounterBox = parseInt($("#endorseeCounter").val()) + 1;
          var endorseeAddress = await App.rbacSC.endorseeAccounts(endorseeCounterBox)
          var endorseeDetails = await App.rbacSC.endorsees(endorseeAddress)
          var result = endorseeDetails.toString().split(",");
          $("#endorseeAddress").text(endorseeAddress);
          $("#endorserAddress").text(result[0]);
          $("#endorseeNotes").text(result[1]);
          var myDate = new Date(result[2]*1000);
          $("#endorseeSince").text(myDate.toLocaleString());
          document.getElementById('endorseeCounter').value =  endorseeCounterBox;
        } catch (error) {
          window.alert("Last endorsee reached.")
        }
    },

    displayEndorseeMinus: async () => {
      try {
        var endorseeCounterBox = parseInt($("#endorseeCounter").val()) - 1;
        var endorseeAddress = await App.rbacSC.endorseeAccounts(endorseeCounterBox)
        var endorseeDetails = await App.rbacSC.endorsees(endorseeAddress)
        var result = endorseeDetails.toString().split(",");
        $("#endorseeAddress").text(endorseeAddress);
        $("#endorserAddress").text(result[0]);
        $("#endorseeNotes").text(result[1]);
        var myDate = new Date(result[2]*1000);
        $("#endorseeSince").text(myDate.toLocaleString());
        document.getElementById('endorseeCounter').value =  endorseeCounterBox;
      } catch (error) {
        window.alert("First endorsee reached.")
      }
    },
  }

$(() => {
  $(window).load(() => {
    App.load()
  })
})
