# Contributing to Pflege-Kopilot

Thank you for your interest in contributing to the Pflege-Kopilot nursing scheduler! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- Use the GitHub issue tracker to report bugs or request features
- Provide detailed information about the issue
- Include steps to reproduce bugs
- Specify your environment (Google Workspace version, browser, etc.)

### Suggesting Enhancements
- Open an issue with the "enhancement" label
- Describe the proposed feature clearly
- Explain the use case and benefits
- Consider backward compatibility

### Code Contributions

#### Getting Started
1. Fork the repository
2. Clone your fork locally
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Commit with clear messages
7. Push to your fork
8. Create a pull request

#### Development Guidelines

##### Code Style
- Follow existing code patterns and naming conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and single-purpose
- Use consistent indentation (2 spaces)

##### Google Apps Script Best Practices
- Use `const` and `let` instead of `var`
- Implement proper error handling
- Use descriptive function names with clear purposes
- Follow the existing modular structure
- Test with different data scenarios

##### Testing
- Test all new functionality thoroughly
- Verify with different staff configurations
- Test edge cases and error conditions
- Ensure backward compatibility
- Test with various shift patterns

#### Pull Request Process

1. **Before Submitting**
   - Ensure your code follows the style guidelines
   - Test your changes thoroughly
   - Update documentation if needed
   - Rebase on the latest main branch

2. **Pull Request Description**
   - Clearly describe what the PR does
   - Reference any related issues
   - Include screenshots for UI changes
   - List any breaking changes

3. **Review Process**
   - All PRs require review
   - Address feedback promptly
   - Keep discussions constructive
   - Be open to suggestions

## 🏗️ Project Structure

```
src/
├── Code.gs              # Main application logic
├── Sidebar.html         # User interface
└── Sidebar.js           # Frontend JavaScript (if needed)

docs/
├── API.md              # API documentation
└── CONFIGURATION.md    # Configuration guide
```

## 🔧 Development Setup

### Prerequisites
- Google Workspace account
- Google Apps Script access
- Git
- Text editor or IDE

### Local Development
1. Clone the repository
2. Create a new Google Apps Script project
3. Copy the code files to your Apps Script project
4. Test your changes in the Apps Script environment
5. Use version control to track your changes

### Testing Environment
- Use a test Google Sheet
- Create test data that represents real scenarios
- Test with different staff configurations
- Verify all menu functions work correctly

## 📋 Coding Standards

### JavaScript/Google Apps Script
- Use modern JavaScript features (ES6+)
- Implement proper error handling with try-catch
- Use meaningful variable names
- Add JSDoc comments for functions
- Follow the existing code organization

### HTML/CSS
- Use semantic HTML
- Follow responsive design principles
- Use consistent naming conventions
- Keep styles organized and maintainable

### Documentation
- Update README.md for significant changes
- Add inline comments for complex logic
- Document new configuration options
- Update API documentation as needed

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment Information**
   - Google Workspace version
   - Browser and version
   - Operating system

2. **Steps to Reproduce**
   - Clear, numbered steps
   - Expected behavior
   - Actual behavior

3. **Additional Context**
   - Screenshots if applicable
   - Error messages
   - Sample data (anonymized)

## 💡 Feature Requests

When suggesting features:

1. **Problem Description**
   - What problem does this solve?
   - Who would benefit from this feature?

2. **Proposed Solution**
   - How should it work?
   - Any specific requirements?

3. **Alternatives Considered**
   - What other approaches were considered?
   - Why is this the best solution?

## 🔒 Security

- Never commit sensitive data or credentials
- Use environment variables for configuration
- Follow security best practices
- Report security issues privately

## 📝 License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project.

## 🙏 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

## 📞 Getting Help

- Check existing issues and discussions
- Ask questions in GitHub Discussions
- Review the documentation
- Contact maintainers for urgent issues

## 🎯 Areas for Contribution

### High Priority
- Bug fixes and stability improvements
- Performance optimizations
- Documentation improvements
- Test coverage

### Medium Priority
- New features and enhancements
- UI/UX improvements
- Additional validation rules
- Export/import functionality

### Low Priority
- Code refactoring
- Additional languages/localization
- Advanced reporting features
- Integration with other systems

---

Thank you for contributing to Pflege-Kopilot! Your contributions help make nursing scheduling more efficient and effective.
