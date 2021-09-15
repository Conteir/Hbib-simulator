export const codeSystems = [
    {
      id: "ICPC-2",
      title: "ICPC-2",
    },
    {
      id: "ICD-10",
      title: "ICD-10",
    },
    
    {
      id: "ATC",
      title: "ATC",
    },

    {
      id: "SNOMED-CT",
      title: "SNOMED-CT",
    },
  ]

  //SNOMED CT CONFIGURATIONS
  export let terminlogyServer: string = 'https://snowstorm.conteir.no';
  export let branchICD10: string = 'MAIN/SNOMEDCT-NO';
  export let branchICPC2: string = 'MAIN/ICPC-2';
  export let branchHbib: string = 'MAIN/SNOMEDCT-NO/HELSEBIBLIOTEKET';

  export let urlParameters: string = '?limit=10&active=true&groupByConcept=true&semanticTags=disorder&semanticTags=finding&language=no&language=nb&language=nn&language=en&conceptActive=true';

  export const snomedURLs =  
  {
    getTerms: terminlogyServer + '/browser/' + branchHbib + '/descriptions' + urlParameters + '&term=',
  }

  export const codeSystemEnv = [
    {
      id: "ICPC-2",
      title: "Primærhelsetjenesten (ICPC-2)",
      url: terminlogyServer + '/browser/' + branchICPC2 + '/members' + urlParameters + '&referenceSet=450993002'
        + '&referencedComponentId='
    },
    {
      id: "ICD-10",
      title: "Spesialisthelsetjenesten (ICD-10)",
      url: terminlogyServer + '/browser/' + branchICD10 + '/members' + urlParameters + '&referenceSet=447562003'
        + '&referencedComponentId='
    }
  ]

  export const params = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Ocp-Apim-Subscription-Key": "89b72a3ad5cf4723b3f489c3eb4d82a1",
    },
  };


//// configurations for hbib
// export const hbibUrl = 'https://qa.hbib.ntf.seeds.no/_/service/com.enonic.app.guillotine/graphql';

export const hbibUrl = 'https://snowstorm.conteir.no/hbibgraph/_/service/com.enonic.app.guillotine/graphql';