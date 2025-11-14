# Distribution Guide 📦

## Quick Distribution

Your ClipMaster app is **ready to share** with friends! Just build and send the installer.

### Build the Installer

```bash
npm run make
```

### Share With Friends

Send them this file:
```
out/make/squirrel.windows/x64/ClipMaster-Setup.exe
```

That's it! No setup required for them! 🎉

---

## What's Included

✅ **OpenAI API Key** - Embedded in the app  
✅ **All dependencies** - Fully self-contained  
✅ **Local database** - Creates automatically on first run  
✅ **Auto-start** - Launches with Windows  
✅ **Desktop shortcut** - Easy access  

## For Your Friends

### Installation
1. Download `ClipMaster-Setup.exe`
2. Run the installer
3. Done! App is ready to use

### No Configuration Needed
- ✅ No API keys to set up
- ✅ No database to configure
- ✅ Works immediately after install

### System Requirements
- Windows 10/11
- ~150MB disk space
- Internet connection (for AI features only)

---

## Cost Information

### You Pay For All Usage
Since your API key is embedded:
- ✅ Friends get free AI features
- ⚠️ You pay for all API calls
- 💰 Typical cost: $0.10-$1 per friend/month

### Monitor Your Usage
**OpenAI Dashboard:** https://platform.openai.com/usage

**Recommended:**
1. Set monthly spending limit: $10-20
2. Enable usage alerts
3. Check usage weekly

### Cost Estimate (gpt-4o-mini)
| Friends | Light Use | Moderate Use | Heavy Use |
|---------|-----------|--------------|-----------|
| 5 friends | $0.50/mo | $2-5/mo | $5-10/mo |
| 10 friends | $1/mo | $5-10/mo | $10-20/mo |
| 20 friends | $2/mo | $10-20/mo | $20-40/mo |

---

## Updating Your Friends

When you release a new version:

1. **Build new installer:**
   ```bash
   npm run make
   ```

2. **Send update to friends:**
   - They can install over the old version
   - All their data is preserved!
   - Notes and clipboard history remain

3. **Data persists:**
   - Stored in: `%APPDATA%\ClipMaster`
   - Safe across updates

---

## Security Notes

### API Key Security
- ✅ Key is compiled into the app (not plain text)
- ✅ Safe for friends/family distribution
- ⚠️ Don't share publicly with strangers
- ⚠️ Don't upload to public download sites

### If Compromised
If someone extracts your key:
1. Revoke it: https://platform.openai.com/api-keys
2. Create new key
3. Update `src/config.js`
4. Rebuild and redistribute

---

## Support for Your Friends

### Common Questions

**Q: Do I need my own OpenAI account?**  
A: No! Everything is included.

**Q: Is my data private?**  
A: Yes! All notes stored locally on their PC.

**Q: Can I use it offline?**  
A: Mostly! Notes work offline, AI features need internet.

**Q: How do I back up my data?**  
A: Copy this file: `%APPDATA%\ClipMaster\clipmaster.db`

### Troubleshooting

**AI features not working?**
- Check internet connection
- Verify OpenAI has credits (your account)

**App won't start?**
- Reinstall the latest version
- Check Windows compatibility (Win 10/11)

---

## Best Practices

### For Small Groups (5-10 people)
✅ Current setup is perfect!  
✅ Monitor usage monthly  
✅ Set $10-20 spending limit  

### For Larger Groups (20+ people)
⚠️ Consider asking users to get their own keys  
⚠️ Or set very low usage limits per person  
⚠️ Monitor usage weekly  

### Going Public
❌ Don't use embedded keys for public apps  
✅ Switch to user-provided keys  
✅ Or use a backend API with authentication  

---

## Version History

Keep a changelog for your friends:

```markdown
## v1.0.0 (Nov 2025)
- Initial release
- Clipboard manager with AI titles
- Markdown note editor
- AI text tools
```

Update `package.json` version and rebuild when you make changes!

---

**Happy Distributing! 🚀**

