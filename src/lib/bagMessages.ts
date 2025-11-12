/**
 * BAG Address Validation - Dutch Language Messages
 *
 * Centralized Dutch language strings for all UI components.
 * Ensures consistent messaging throughout the application.
 */

export const BAG_MESSAGES = {
  // Upload Section
  upload: {
    title: 'Upload je Excel bestand met adressen',
    titleDragging: 'Sleep je bestand hier',
    description: 'Sleep je .xlsx bestand hier, of klik op de knop om te bladeren',
    buttonLabel: 'Kies bestand',
    supportedFormats: 'Ondersteunde formaten: .xlsx (max 10 MB)',
    fileSelected: 'Bestand geselecteerd',
    clearFile: 'Verwijder geselecteerd bestand',
    chooseFile: 'Kies bestand om te uploaden',
  },

  // Validation Status Messages
  validation: {
    queued: 'Je bestand staat in de wachtrij...',
    uploading: 'Uploaden naar BAG server...',
    processing: 'Valideren van adressen...',
    validating: 'Controleren tegen BAG database...',
    complete: 'Validatie voltooid!',
    progressLabel: 'Voortgang',
    addressesProcessed: 'adressen verwerkt',
    keepWindowOpen: 'Je kunt dit venster geopend laten. We houden je op de hoogte van de voortgang.',
  },

  // Validation Phase Messages (displayed during processing)
  phases: {
    reading: 'Excel structuur wordt gelezen...',
    parsing: 'Adressen worden uitgelezen...',
    validating: 'Validatie tegen BAG database...',
    matching: 'Adressen worden gematched...',
    finalizing: 'Resultaten worden voorbereid...',
  },

  // Download Section
  download: {
    title: 'Validatie succesvol afgerond!',
    description: 'Je bestand is succesvol gevalideerd tegen de BAG database. Download de resultaten hieronder.',
    buttonLabel: 'Download Resultaten',
    downloading: 'Downloaden...',
    newValidation: 'Nieuwe Validatie',
    newValidationLabel: 'Start nieuwe validatie',
    multipleDownloads: 'Je kunt het bestand meerdere keren downloaden indien nodig.',
    summaryTitle: 'Validatie Overzicht',
    fileLabel: 'Bestand:',
    statusLabel: 'Status:',
    statusComplete: 'Compleet',
  },

  // Error Messages
  errors: {
    // Error View Titles
    networkTitle: 'Verbindingsprobleem',
    apiTitle: 'Server fout',
    validationTitle: 'Validatiefout',
    unknownTitle: 'Er is iets misgegaan',

    // BAG-Specific Error Messages
    invalidFileType: 'Alleen .xlsx bestanden zijn toegestaan voor BAG validatie',
    excelStructureError: 'Excel bestand heeft niet de juiste structuur voor BAG validatie',
    fileNotFound: 'Sessie niet gevonden. Start een nieuwe validatie.',
    rateLimitExceeded: 'Te veel verzoeken. Wacht een minuut en probeer opnieuw.',
    internalServerError: 'Server fout. Ons team is op de hoogte. Probeer later opnieuw.',
    validationFailed: 'Validatie mislukt. Controleer je Excel bestand.',
    uploadFailed: 'Upload mislukt. Probeer opnieuw.',
    downloadFailed: 'Download mislukt. Probeer opnieuw.',
    networkError: 'Geen verbinding met de server. Controleer je internetverbinding.',
    timeout: 'Verzoek duurde te lang. Probeer opnieuw.',
    validationTimeout: 'Validatie duurde te lang. Probeer met een kleiner bestand.',
    sessionExpired: 'Sessie verlopen. Start een nieuwe validatie.',

    // Suggested Actions
    whatToDo: 'Wat kun je doen:',
    networkActions: [
      'Controleer je internetverbinding',
      'Probeer het opnieuw over een paar seconden',
      'Gebruik een stabielere verbinding indien mogelijk',
    ],
    apiActions: [
      'Probeer het over een paar minuten opnieuw',
      'Het probleem is bij ons bekend',
      'Neem contact op met support als het blijft gebeuren',
    ],
    validationActions: [
      'Controleer of je bestand aan de eisen voldoet',
      'Zorg dat het bestand de juiste kolommen heeft (straat, huisnummer, postcode, plaats)',
      'Probeer een ander bestand',
    ],
    unknownActions: [
      'Probeer de pagina te vernieuwen',
      'Probeer het opnieuw',
      'Neem contact op met support als het probleem aanhoudt',
    ],

    // Error Action Buttons
    retryButton: 'Probeer opnieuw',
    resetButton: 'Terug naar upload',
    technicalDetails: 'Technische details:',
    statusCode: 'Status code:',
  },

  // Toast Notifications
  toasts: {
    uploadSuccess: 'Bestand succesvol geupload',
    validationStarted: 'Validatie gestart',
    validationComplete: 'Validatie compleet',
    downloadSuccess: 'Bestand succesvol gedownload',
    downloadFailed: 'Download mislukt',
    cleanupFailed: 'Cleanup mislukt (dit heeft geen invloed op je resultaten)',
  },
} as const;
