# 📚 Internal Documentation

**For Contributors Only** - Available in `develop` branch, excluded from `main` branch.

## 📋 Documentation Files

- **TODO-INTEGRATION.md** - Integration tasks and checklist for auth/database team coordination
- **RAG_AI_INTEGRATION.md** - Guide for integrating RAG AI system with current backend
- **POSTMAN_API_GUIDE.md** - API testing guide for Postman

## 🔀 Branch Strategy

**Develop Branch:**
- ✅ This `docs/` folder is tracked and available
- ✅ Contributors can `git pull` to get latest docs
- ✅ Commit and push doc updates here

**Main Branch:**
- ❌ This `docs/` folder is automatically excluded
- ❌ Won't appear in production releases
- ✅ Keeps internal docs private from public

## 📝 Workflow for Contributors

### To get latest docs:
```bash
git checkout develop
git pull origin develop
# docs/ folder will be updated
```

### To update docs:
```bash
git checkout develop
# Edit files in docs/
git add packages/recovery-system/backend/docs/
git commit -m "Update documentation"
git push origin develop
```

### When merging to main:
```bash
# docs/ folder is automatically excluded via .gitattributes
git checkout main
git merge develop
# docs/ won't be included in main branch
```

## 🔒 Privacy Notice

- Docs are shared among contributors via `develop` branch
- Automatically excluded when merging to `main` branch
- Public releases won't include internal documentation

## 📝 Adding New Docs

1. Make sure you're on `develop` branch
2. Create your `.md` file in this `docs/` folder
3. Commit and push to `develop`
4. Other contributors will get it when they pull

---

**Last Updated:** February 6, 2026  
**Branch:** develop only
