// perfection is bloated.
const modbase = 541; const modsub = 70000; let modsig = modbase.toString()+modsub.toString();
const Prim = "#9f80ff", Seco = "#bf80ff", Tert = "#df80ff", Gry = "#999999", Wht = "#ffffff", Org = "#ffbf80", Red = "#ff8080"
const hueArray = ['#ffb3b3', '#ffc6b3', '#ffd9b3', '#ffecb3', '#ffffb3', '#ecffb3', '#d9ffb3', '#c6ffb3', '#b3ffb3', '#b3ffc6', '#b3ffd9', '#b3ffec', '#b3ffff', '#b3ecff', '#b3d9ff', '#b3c6ff', '#b3b3ff', '#c6b3ff', '#d9b3ff', '#ecb3ff', '#ffb3ff', '#ffb3ec', '#ffb3d9', '#ffb3c6']

module.exports = function YARM(d) {
    let basevalue = modsig-1;
    let cindex = -1, characters = [];

    d.command.add(['relog', 'yarm'], (arg) => {
      if (!d.game.me.alive) error('0x0'); if (d.game.me.inCombat) error('0x1'); // would desync server state since you can't relog in combat or while dead
      if (arg){
        if (['nx','+','++'].includes(arg)) relog(`+`);
        else if (['pv','-','--'].includes(arg)) relog(`-`);
        else if (arg){ let index = parseInt(arg);
          if (!isNaN(index)) { if (index > characters.length){ error('0x2',index); } else { cindex = index - 1; relog(); } }
          else { if (charindex(arg)){ relog(); } else { commandPane(); error('0x3',arg); } }
        }
      }
      else printCharacters();
    })

    d.hook('C_REQUEST_NONDB_ITEM_INFO', '*', (e) => { // what we have here is some supreme autism, courtesy of a github user called supremesorc
      if (e.item <= modsig+99 && e.item >= modsig){
        basevalue = modsig-1;
        process.nextTick(() => { if (e.item > 0){ d.command.exec(`relog ${(e.item - basevalue)}`); } });
        return false;
      }
      else return;
    })

    d.hook('S_GET_USER_LIST', 21, (e) => {
      e.characters.forEach((ch) => {
        let { id, name, position, adventureCoins } = ch;
        characters[--position] = { id, name, adventureCoins };
      });
    });

    d.hook('C_SELECT_USER', 1, { order: 100, filter: { fake: null } }, (e) => { cindex = characters.findIndex((ch) => ch.id === e.id); });

    function charindex(name) {
      let res = characters.findIndex((ch) => ch.name.toLowerCase() === name.toLowerCase());
      if (res >= 0) {
        cindex = res;
        return true;
      }
      return false;
    }

    function relog(arg){
      if (arg){
        if (arg == `+`){ if (!characters[++cindex]) cindex = 0; }
        if (arg == `-`){ if (!characters[--cindex]) cindex = 0; }
        relog();
      }
      let id = characters[cindex].id;
      let prepareLobbyHook, lobbyHook
      d.send('C_RETURN_TO_LOBBY', 1, {})
      prepareLobbyHook = d.hookOnce('S_PREPARE_RETURN_TO_LOBBY', 1, () => {
        d.send('S_RETURN_TO_LOBBY', 1, {});
        lobbyHook = d.hookOnce('S_RETURN_TO_LOBBY', 1, () => {
          setImmediate(() => {
            d.send('C_SELECT_USER', 1, { id: id, unk: 0 });
          });
        });
      });
      setTimeout(() => {
        for (const hook of [prepareLobbyHook, lobbyHook])
          if (hook)
            d.unhook(hook)
      }, 16000)
    }

    function error(reason,info) {
      switch (reason){
        case '0x0': d.command.message(`<font color="${Red}">You cannot YARM while dead.</font>`); break;
        case '0x1': d.command.message(`<font color="${Red}">You cannot YARM while in combat.</font>`); break;
        case '0x2': d.command.message(`<font color="${Red}">Not enough characters to populate your argument ${info}.</font>`); break;
        case '0x3': d.command.message(`<font color="${Red}">The character you provided (<font color="${Org}">${info}</font>) does not exist.</font>`); break;
        default: d.command.message(`<font color="${Red}">Unknown error.</font>`)
      }
    }

    function printCharacters() {
      basevalue = modsig-1;
        characters.forEach((ch, i) => {
          basevalue = basevalue + 1
          d.command.base.message(false, `<font color="${hueArray[i]}"><ChatLinkAction param=\"1#####${basevalue}@-1@Hail\">[Relog]</ChatLinkAction></font> <font color="${Prim}">${(i + 1)}</font>` + `<font color="${Gry}"> : </font>` + `<font color="${Seco}">${ch.name}</font>` + ` <font color="${Tert}"><font color="${Gry}">(</font>${ch.adventureCoins}<font color="${Gry}">)</font></font>`);
        });
    }

    function commandPane () { d.command.message(`<font color="${Gry}">{</font> <font color="${Prim}">Yet Another Relog Mod <font color="${Gry}">==></font> Command Pane</font> <font color="${Gry}">}</font>
<font color="${Prim}">relog</font> <font color="${Seco}">(name)</font> <font color="${Gry}">:</font> <font color="${Wht}">Relogs to the character with your given name.</font>
<font color="${Prim}">relog</font> <font color="${Seco}">[nx <font color="${Gry}">||</font> + <font color="${Gry}">||</font> f] </font><font color="${Gry}">:</font> <font color="${Wht}">Relogs you to the next character in your list.</font>
<font color="${Prim}">relog</font> <font color="${Seco}">[pv <font color="${Gry}">||</font> - <font color="${Gry}">||</font> b] </font><font color="${Gry}">:</font> <font color="${Wht}">Relogs you to the previous character in your list.</font>`)}
}