function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.usuario) {
        // Usuário autenticado
        return next();
    }
    // Não autenticado, redireciona para login
    res.redirect('/');
}

module.exports = ensureAuthenticated;