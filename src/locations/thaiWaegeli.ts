import { LocationMenu } from '../sharedModels';

export function parseMenu(): LocationMenu[] {
  return [
    {
      name: 'Nudelsuppe - Poulet',
      details: [
        'Für die Suppenbrühe werden Poulet-Knochen, Gemüse, Gewürze und Kräuter mehrere Stunden eingekocht und verleihen unserer Suppe einen intensiven Geschmack.'
      ]
    },
    {
      name: 'Nudelsuppe - Vegi',
      details: [
        'Unsere vegetarische Suppenbrühe wird ausschliesslich mit Gemüse, Gewürzen und Kräutern zubereitet.'
      ]
    },
    {
      name: 'Thai Dumplings',
      details: [
        'Gedämpfte Dumplings mit Poulet und Shrimps / Sauce nach Wahl'
      ]
    }
  ];
}
