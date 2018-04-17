import Identity from '../models/Identity'
import Prompt from '../models/prompts/Prompt';
import * as PromptTypes from '../models/prompts/PromptTypes'
import NotificationService from '../services/NotificationService'

export default class IdentityService {

    //TODO Mock
    static register(name, scatter){
        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }

    //TODO Mock
    static nameExists(name, scatter){
        return new Promise((resolve, reject) => {
            // Check if exists within another scatter
            resolve(false);
        })
    }

    static identityPermission(domain, network, scatter){
        return scatter.keychain.permissions.find(perm =>
            perm.isIdentityFor(domain, network) &&
            perm.identityIsNotDisabled(scatter.keychain)
        );
    }

    static identityFromPermissionsOrNull(domain, network, scatter){
        const identityFromPermission = IdentityService.identityPermission(domain, network, scatter);
        return identityFromPermission ? identityFromPermission.identity(scatter.keychain) : null;
    }

    static getOrRequestIdentity(domain, network, fields, scatter, callback){

        // Possibly getting an Identity that has been synced with this application.
        const identityFromPermission = IdentityService.identityFromPermissionsOrNull(domain, network, scatter);
        let identity = identityFromPermission;

        const sendBackIdentity = id => {
            if(!id || id.hasOwnProperty('isError')){
                callback(null, null);
                return false;
            }

            callback(id.asOnlyRequiredFields(fields, network), !!identityFromPermission);
        };

        if(identity){
            // Even though there is a previous permission,
            // the identity might have changed and no longer
            // meets the requirements.
            if(identity.hasRequiredFields(fields, network)){
                sendBackIdentity(identity);
                return false;
            } else {
                // TODO: Remove permission
            }
        }
        else NotificationService.open(new Prompt(PromptTypes.REQUEST_IDENTITY, domain, network, fields, sendBackIdentity));
    }
}