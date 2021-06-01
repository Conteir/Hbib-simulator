import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../index.css';

export const Documentation = class Documentation extends React.Component {

    render() {
        return (
            <div>
                <div className="jumbotron text-center">
                    <h1>Dokumentasjon</h1>
                    <p>Read this important information</p>
                </div>
               
                <p>Søk i HAPI er en enkel tjeneste for å gjøre oppslag mot Helsedirektoratets
                    innholdstjenester i API-et HAPI. Dokumentasjon og tilgang til API-et
                    finner du her: 
                        <a href="https://utvikler.helsedirektoratet.no">https://utvikler.helsedirektoratet.no</a>
                </p>

                <h2>Slik bruker du tjenesten</h2>
                <p>Du kan gjøre spørringer etter alt innhold i API-et basert på enten:</p>
                    <ul>
                        <li>Innholdets unike ID</li>
                        <li>En kode fra et kodeverk eller en terminologi. Du vil da få oppslag på innhold som er <em>klinisk relevant</em>
                            for den koden eller begrepet du bruker i søket.</li>
                    </ul>
                <h3>Slik finner du unik ID til innhold</h3>
                <p>Under menypunktet «Get ID» velger du innholdstypen du ønsker å hente ut av API-et.
                    Du trykker deretter på «Search» og tjenesten vil returnere alle instanser av denne innholdstypen med
                    tittel og ID. Du kan deretter kopiere ID-en og lime den inn i søkefeltet «HAPI-id» på forsiden.
                </p>
                <h2>Naviger til tilknyttet innhold</h2>
                <p>Under fanen "Link navigation" finner du lenker til tilknyttet innhold. Tilknyttet innhold kan enten være foreldre eller barn. Et eksempel:</p>
                <p>En <em>retningslinje</em> vil ha <em>kapitler</em> som <em>barn</em>. <em>Kapitler</em> vil igjen ha <em>anbefalinger</em> som barn.
                    Hvis du henter ut en <em>anbefaling</em> vil <em>kapittelet</em> det hører til listes ut som en forelder.</p>
            </div>
        )
    }

}

export default Documentation;