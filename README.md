# RSInject

## Purpose 

ReadSpeaker (https://www.readspeaker.com/) is a service that allows web developers to have their webpage read out loud. A single player can read a whole webpage.

On dynamic sites (Vue, React, other SPA) this becomes complex to set up, because parts of the page may (dis)appear as a user navigates the site. ReadSpeaker can not read text that is not on the page.

The obvious solution is to add player links to all dynamic parts of the site, and optionally have a single player somewhere in the layout that these links refer to. ReadSpeaker can do that (https://wrdev.readspeaker.com/get-started/implementation/split-button-implementation).

But this can have a big impact on your design for a feature that is only intended for a small audience. There could be player links in lots of places. The obvious solution here is to let a user choose to turn the feature on or off, and show or hide the links accordingly. You could do this with css.

RSInject tries to solve this in a generic manner. 

## How it works

Once loaded and enabled, RSInject *injects* ReadSpeaker player links into the page according to a config file that determines which 'zones' should be readable, and watches for changes in the page to see if new 'readable' zones appear. If a user disables it, RSInject stops watching and removes the existing player links, returning the site to its original state.

In effect, you only have to insert the ReadSpeaker player in your design, and configure which zones should be readable. Optionally, you can add buttons in your design to load and enable ReadSpeaker; disabling ReadSpeaker is already handled by the close button on the player.

There are 2 versions: a 'plain' typescript version and a Vue version.
Look in the folders for each to read instructions on how to install
it, and optionally build your own demo. They both use the same source
from `common/src/`, each with a different header.










